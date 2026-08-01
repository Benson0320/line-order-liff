/**
 * LINE Hair Salon Ordering System
 * Apps Script 共用工具
 */

function lhoNormalizeText_(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function lhoNormalizeHeader_(value) {
  return lhoNormalizeText_(value)
    .replace(/\s+/g, "")
    .toLowerCase();
}

function lhoJsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function lhoSuccessResponse_(data) {
  return lhoJsonResponse_(
    Object.assign(
      {
        success: true,
        version: LHO_CONFIG.VERSION
      },
      data || {}
    )
  );
}

function lhoErrorResponse_(code, message, details) {
  var payload = {
    success: false,
    version: LHO_CONFIG.VERSION,
    error: code || "UNKNOWN_ERROR",
    message: message || "系統發生錯誤。"
  };

  if (details) {
    payload.details = details;
  }

  return lhoJsonResponse_(payload);
}

function lhoFindHeaderIndex_(headers, candidates) {
  var normalizedHeaders = headers.map(lhoNormalizeHeader_);
  var normalizedCandidates = candidates.map(lhoNormalizeHeader_);

  for (var index = 0; index < normalizedHeaders.length; index += 1) {
    if (normalizedCandidates.indexOf(normalizedHeaders[index]) >= 0) {
      return index;
    }
  }

  return -1;
}

function lhoNaturalCompare_(left, right) {
  var leftText = lhoNormalizeText_(left).toUpperCase();
  var rightText = lhoNormalizeText_(right).toUpperCase();

  var leftParts = leftText.match(/\d+|\D+/g) || [leftText];
  var rightParts = rightText.match(/\d+|\D+/g) || [rightText];
  var length = Math.max(leftParts.length, rightParts.length);

  for (var index = 0; index < length; index += 1) {
    var leftPart = leftParts[index];
    var rightPart = rightParts[index];

    if (leftPart === undefined) {
      return -1;
    }

    if (rightPart === undefined) {
      return 1;
    }

    var leftNumber = Number(leftPart);
    var rightNumber = Number(rightPart);
    var bothNumbers =
      !isNaN(leftNumber) &&
      !isNaN(rightNumber) &&
      /^\d+$/.test(leftPart) &&
      /^\d+$/.test(rightPart);

    if (bothNumbers && leftNumber !== rightNumber) {
      return leftNumber - rightNumber;
    }

    if (leftPart !== rightPart) {
      return leftPart < rightPart ? -1 : 1;
    }
  }

  return 0;
}

function lhoIsEnabledValue_(value) {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return true;
  }

  var normalized = typeof value === "string"
    ? value.trim()
    : value;

  if (LHO_CONFIG.FALSE_VALUES.indexOf(normalized) >= 0) {
    return false;
  }

  if (LHO_CONFIG.TRUE_VALUES.indexOf(normalized) >= 0) {
    return true;
  }

  return Boolean(normalized);
}

function lhoSafeErrorMessage_(error) {
  if (!error) {
    return "未知錯誤";
  }

  if (error.message) {
    return String(error.message);
  }

  return String(error);
}

function lhoWriteLog_(scope, message, data) {
  var prefix = "[LHO][" + lhoNormalizeText_(scope || "SYSTEM") + "]";
  var output = prefix + " " + lhoNormalizeText_(message);

  if (data !== undefined) {
    try {
      output += " " + JSON.stringify(data);
    } catch (error) {
      output += " [無法序列化附加資料]";
    }
  }

  console.log(output);

  /**
   * 與既有專案相容：
   * 如果原專案有 writeLog()，額外寫入既有 Log。
   */
  if (
    typeof writeLog === "function" &&
    writeLog !== lhoWriteLog_
  ) {
    try {
      writeLog("LIFF", lhoNormalizeText_(message));
    } catch (error) {
      console.warn(
        "[LHO] 既有 writeLog() 呼叫失敗：" +
        lhoSafeErrorMessage_(error)
      );
    }
  }
}
