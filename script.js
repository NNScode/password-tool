/* =========================================
   1. KHAI BÁO BIẾN & LẤY PHẦN TỬ DOM
   ========================================= */

console.clear();

// --- Các phần tử DOM cho "Kiểm tra độ mạnh" ---
const togglePasswordBtn = document.getElementById("togglePasswordBtn");
const passwordInput = document.getElementById("passwordInput");
const eyeIcon = togglePasswordBtn.querySelector("i");
const strengthBarFill = document.getElementById("strengthBarFill");
const strengthFeedback = document.getElementById("strengthFeedback");
const strengthSuggestions = document.getElementById("strengthSuggestions");

// --- Các phần tử DOM cho "Sinh mật khẩu" ---
const resultEl = document.getElementById("result");
const lengthEl = document.getElementById("slider");
const uppercaseEl = document.getElementById("uppercase");
const lowercaseEl = document.getElementById("lowercase");
const numberEl = document.getElementById("number");
const symbolEl = document.getElementById("symbol");
const generateBtn = document.getElementById("generate");
const copyBtn = document.getElementById("copy-btn");
const slider = document.querySelector(".range__slider");
const sliderValue = document.querySelector(".length__title");
const resultContainer = document.querySelector(".result");
const copyInfo = document.querySelector(".result__info.right");
const copiedInfo = document.querySelector(".result__info.left");

// --- Các biến trạng thái & cài đặt ---

// Cài đặt màu cho thanh slider
const sliderProps = {
  fill: "#209cff",
  background: "rgba(255, 255, 255, 0.214)",
};

// Biến kiểm tra mật khẩu đã được sinh hay chưa (để copy)
let generatedPassword = false;

// Tọa độ của box kết quả
let resultContainerBound = {
  left: resultContainer.getBoundingClientRect().left,
  top: resultContainer.getBoundingClientRect().top,
};

// Các hàm tạo ký tự ngẫu nhiên
const randomFunc = {
  lower: getRandomLower,
  upper: getRandomUpper,
  number: getRandomNumber,
  symbol: getRandomSymbol,
};

/* ===============================
   2. GÁN CÁC BỘ LẮNG NGHE SỰ KIỆN
   =============================== */

// --- Sự kiện cho "Kiểm tra độ mạnh" ---

// Click nút "Ẩn/Hiện mật khẩu"
togglePasswordBtn.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";

  eyeIcon.classList.toggle("fa-eye", isPassword);
  eyeIcon.classList.toggle("fa-eye-slash", !isPassword);
});

// Gõ phím trên ô nhập mật khẩu
passwordInput.addEventListener("input", () => {
  const password = passwordInput.value;
  const analysis = analyzePasswordStrength(password);
  updateStrengthUI(analysis);
});

// --- Sự kiện cho "Sinh mật khẩu" ---

// Kéo thanh slider
slider.querySelector("input").addEventListener("input", (event) => {
  sliderValue.setAttribute("data-length", event.target.value);
  applyFill(event.target);
});

// Click nút "Sinh mật khẩu"
generateBtn.addEventListener("click", () => {
  const length = +lengthEl.value;
  const hasLower = lowercaseEl.checked;
  const hasUpper = uppercaseEl.checked;
  const hasNumber = numberEl.checked;
  const hasSymbol = symbolEl.checked;

  generatedPassword = true;
  resultEl.innerText = generatePassword(
    length,
    hasLower,
    hasUpper,
    hasNumber,
    hasSymbol
  );

  // Hiển thị thông báo "Nhấp chuột để sao chép"
  copyInfo.style.transform = "translateY(0%)";
  copyInfo.style.opacity = "0.75";
  copiedInfo.style.transform = "translateY(200%)";
  copiedInfo.style.opacity = "0";
});

// Click các checkbox (không cho tắt cái cuối cùng)
[uppercaseEl, lowercaseEl, numberEl, symbolEl].forEach((el) => {
  el.addEventListener("click", () => {
    disableOnlyCheckbox();
  });
});

// Di chuột trên box kết quả (nút copy)
resultContainer.addEventListener("mousemove", (e) => {
  if (generatedPassword) {
    copyBtn.style.opacity = "1";
    copyBtn.style.pointerEvents = "all";
    copyBtn.style.setProperty("--x", `${e.x - resultContainerBound.left}px`);
    copyBtn.style.setProperty("--y", `${e.y - resultContainerBound.top}px`);
  } else {
    copyBtn.style.opacity = "0";
    copyBtn.style.pointerEvents = "none";
  }
});

// Click nút "Copy"
copyBtn.addEventListener("click", () => {
  const textarea = document.createElement("textarea");
  const password = resultEl.innerText;

  if (!password || password == "CLICK GENERATE") {
    return;
  }

  textarea.value = password;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();

  // Hiển thị thông báo "Đã sao chép"
  copyInfo.style.transform = "translateY(200%)";
  copyInfo.style.opacity = "0";
  copiedInfo.style.transform = "translateY(0%)";
  copiedInfo.style.opacity = "0.75";
});

// Resize cửa sổ (để cập nhật tọa độ box)
window.addEventListener("resize", (e) => {
  resultContainerBound = {
    left: resultContainer.getBoundingClientRect().left,
    top: resultContainer.getBoundingClientRect().top,
  };
});

/* ======================
   3. CÁC HÀM XỬ LÝ LOGIC
   ====================== */

// --- Các hàm cho "Kiểm tra độ mạnh" ---

/**
 * Hàm phân tích mật khẩu và trả về điểm/gợi ý.
 */
function analyzePasswordStrength(password) {
  let score = 0;
  const suggestions = [];

  // Nếu không nhập gì, reset
  if (password.length === 0) {
    return { score: 0, suggestions: [] };
  }

  // 1. Tiêu chí độ dài
  if (password.length < 8) {
    suggestions.push('<li><i class="fa-solid fa-square-xmark icon-invalid"></i> Phải có ít nhất 8 ký tự</li>');
  } else if (password.length >= 12) {
    score += 25;
    suggestions.push('<li><i class="fa-solid fa-square-check icon-valid"></i> Độ dài rất tốt</li>');
  } else {
    score += 10;
    suggestions.push('<li><i class="fa-solid fa-square-check icon-valid"></i> Độ dài đạt yêu cầu</li>');
  }

  // 2. Tiêu chí chữ hoa
  if (/[A-Z]/.test(password)) {
    score += 25;
    suggestions.push('<li><i class="fa-solid fa-square-check icon-valid"></i> Có chứa chữ hoa</li>');
  } else {
    suggestions.push('<li><i class="fa-solid fa-square-xmark icon-invalid"></i> Cần thêm chữ hoa</li>');
  }

  // 3. Tiêu chí số
  if (/[0-9]/.test(password)) {
    score += 25;
    suggestions.push('<li><i class="fa-solid fa-square-check icon-valid"></i> Có chứa số</li>');
  } else {
    suggestions.push('<li><i class="fa-solid fa-square-xmark icon-invalid"></i> Cần thêm số</li>');
  }

  // 4. Tiêu chí ký tự đặc biệt
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 25;
    suggestions.push('<li><i class="fa-solid fa-square-check icon-valid"></i> Có chứa ký tự đặc biệt</li>');
  } else {
    suggestions.push('<li><i class="fa-solid fa-square-xmark icon-invalid"></i> Cần thêm ký tự đặc biệt</li>');
  }

  if (score > 100) {
    score = 100;
  }

  return { score, suggestions };
}

/**
 * Hàm giao diện Thanh đo, màu sắc, văn bản
 */
function updateStrengthUI(analysis) {
  // Cập nhật value của thanh <progress>
  strengthMeter.value = analysis.score;

  // Mặc định ban đầu màu đỏ (Yếu)
  let background = "linear-gradient(90deg, #ff416c, #ff4b2b)";

  if (analysis.score === 100) {
    background = "linear-gradient(90deg, #27ae60, #2575fc)";
  } else if (analysis.score >= 75) {
    background = "linear-gradient(90deg, #a8e063, #56ab2f)";
  } else if (analysis.score >= 50) {
    background = "linear-gradient(90deg, #f39c12, #fdd835)";
  }

  strengthSuggestions.innerHTML = analysis.suggestions.join("");

  // Set giá trị biến --progress-color
  strengthMeter.style.setProperty("--progress-color", background);
}

// --- Các hàm cho "Sinh mật khẩu" ---

// Hàm tô màu nền cho thanh slider
function applyFill(slider) {
  const percentage =
    (100 * (slider.value - slider.min)) / (slider.max - slider.min);
  const bg = `linear-gradient(90deg, ${sliderProps.fill} ${percentage}%, ${
    sliderProps.background
  } ${percentage + 0.1}%)`;
  slider.style.background = bg;
  sliderValue.setAttribute("data-length", slider.value);
}

// Hàm sinh mật khẩu chính
function generatePassword(length, lower, upper, number, symbol) {
  let generatedPassword = "";
  const typesCount = lower + upper + number + symbol;
  const typesArr = [{ lower }, { upper }, { number }, { symbol }].filter(
    (item) => Object.values(item)[0]
  );

  if (typesCount === 0) {
    return "";
  }

  for (let i = 0; i < length; i++) {
    typesArr.forEach((type) => {
      const funcName = Object.keys(type)[0];
      generatedPassword += randomFunc[funcName]();
    });
  }

  return generatedPassword.slice(0, length);
}

// Hàm vô hiệu hóa checkbox cuối cùng
function disableOnlyCheckbox() {
  let totalChecked = [uppercaseEl, lowercaseEl, numberEl, symbolEl].filter(
    (el) => el.checked
  );

  totalChecked.forEach((el) => {
    if (totalChecked.length == 1) {
      el.disabled = true;
    } else {
      el.disabled = false;
    }
  });
}

// Hàm tạo số ngẫu nhiên "an toàn" hơn
function secureMathRandom() {
  return (
    window.crypto.getRandomValues(new Uint32Array(1))[0] / (Math.pow(2, 32) - 1)
  );
}

// Các hàm tạo ký tự ngẫu nhiên
function getRandomLower() {
  return String.fromCharCode(Math.floor(Math.random() * 26) + 97);
}
function getRandomUpper() {
  return String.fromCharCode(Math.floor(Math.random() * 26) + 65);
}
function getRandomNumber() {
  return String.fromCharCode(Math.floor(secureMathRandom() * 10) + 48);
}
function getRandomSymbol() {
  const symbols = '~!@#$%^&*()_+{}":?><;.,';
  return symbols[Math.floor(Math.random() * symbols.length)];
}

// --- Khởi chạy các hàm ban đầu ---

// Tô màu slider lần đầu khi tải trang
applyFill(slider.querySelector("input"));
