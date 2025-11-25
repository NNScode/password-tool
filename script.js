/* =========================================
   1. KHAI BÁO BIẾN & LẤY PHẦN TỬ DOM
   ========================================= */

console.clear();

// --- DOM cho Kiểm tra độ mạnh ---
const togglePasswordBtn = document.getElementById("togglePasswordBtn");
const passwordInput = document.getElementById("passwordInput");
const eyeIcon = togglePasswordBtn.querySelector("i");
const strengthMeter = document.getElementById("strengthMeter");
const strengthSuggestions = document.getElementById("strengthSuggestions");

// --- DOM cho Sinh mật khẩu ---
const resultEl = document.getElementById("result");
const lengthEl = document.getElementById("slider");

// [QUAN TRỌNG] Sửa lại selector này để tìm đúng class hiển thị số
const lengthTitle = document.querySelector(".length__title");

const uppercaseEl = document.getElementById("uppercase");
const lowercaseEl = document.getElementById("lowercase");
const numberEl = document.getElementById("number");
const symbolEl = document.getElementById("symbol");

const generateBtn = document.getElementById("generate");
const copyBtn = document.getElementById("copy-btn");
const copyInfo = document.querySelector(".result__info.right");
const copiedInfo = document.querySelector(".result__info.left");
const resultContainer = document.querySelector(".result");

// --- DOM cho Acronym ---
const passphraseInput = document.getElementById("passphraseInput");
const generateAcronymBtn = document.getElementById("generateAcronym");

// --- Biến trạng thái ---
const sliderProps = {
    fill: "#3b82f6",
    background: "#334155",
};

let generatedPassword = false;
let resultContainerBound = {
    left: resultContainer.getBoundingClientRect().left,
    top: resultContainer.getBoundingClientRect().top,
};

const randomFunc = {
    lower: getRandomLower,
    upper: getRandomUpper,
    number: getRandomNumber,
    symbol: getRandomSymbol,
};

/* ===============================
   2. XỬ LÝ SỰ KIỆN (EVENT LISTENERS)
   =============================== */

// 1. Toggle Ẩn/Hiện mật khẩu
togglePasswordBtn.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    eyeIcon.classList.toggle("fa-eye", isPassword);
    eyeIcon.classList.toggle("fa-eye-slash", !isPassword);
});

// 2. Nhập liệu kiểm tra
passwordInput.addEventListener("input", () => {
    const password = passwordInput.value;
    const analysis = analyzePasswordStrength(password);
    updateStrengthUI(analysis);
});

// 3. SLIDER EVENT (ĐÃ SỬA LỖI)
lengthEl.addEventListener("input", (event) => {
    const value = event.target.value;

    // [FIX] Cập nhật attribute data-length để CSS hiển thị số ra màn hình
    lengthTitle.setAttribute("data-length", value);

    // Tô màu thanh kéo
    applySliderFill(event.target);
});

// 4. Sinh mật khẩu
generateBtn.addEventListener("click", () => {
    const length = +lengthEl.value;
    const hasLower = lowercaseEl.checked;
    const hasUpper = uppercaseEl.checked;
    const hasNumber = numberEl.checked;
    const hasSymbol = symbolEl.checked;

    const password = generatePassword(length, hasLower, hasUpper, hasNumber, hasSymbol);

    generatedPassword = true;
    displayResult(password);
    resetCopyText();
});

// 5. Tạo Acronym
generateAcronymBtn.addEventListener("click", () => {
    const sentence = passphraseInput.value.trim();
    if (!sentence) {
        alert("Vui lòng nhập một câu!");
        return;
    }
    const password = createAcronymFromSentence(sentence);
    generatedPassword = true;
    displayResult(password);
    resetCopyText();
});

// 6. Copy Logic
window.addEventListener("resize", (e) => {
    resultContainerBound = resultContainer.getBoundingClientRect();
});

resultContainer.addEventListener("mousemove", (e) => {
    resultContainerBound = resultContainer.getBoundingClientRect();
    if (generatedPassword) {
        copyBtn.style.opacity = "1";
        copyBtn.style.pointerEvents = "all";
        copyBtn.style.setProperty("--x", `${e.clientX - resultContainerBound.left}px`);
        copyBtn.style.setProperty("--y", `${e.clientY - resultContainerBound.top}px`);
    } else {
        copyBtn.style.opacity = "0";
        copyBtn.style.pointerEvents = "none";
    }
});

copyBtn.addEventListener("click", () => {
    const password = resultEl.innerText;
    if (!password || password == "CLICK GENERATE") return;

    navigator.clipboard.writeText(password).then(() => {
        copyInfo.style.opacity = "0";
        copyInfo.style.transform = "translateY(-20px)";
        copiedInfo.style.opacity = "1";
        copiedInfo.style.transform = "translateY(0)";
        copyBtn.style.background = "#2ecc71";
        copyBtn.style.color = "white";

        setTimeout(() => {
            resetCopyText();
            copyBtn.style.background = "white";
            copyBtn.style.color = "#0a0e30";
        }, 2000);
    });
});

[uppercaseEl, lowercaseEl, numberEl, symbolEl].forEach(el => {
    el.addEventListener('click', () => {
        const checkedCount = [uppercaseEl, lowercaseEl, numberEl, symbolEl].filter(x => x.checked).length;
        if (checkedCount === 0) el.checked = true;
    });
});

/* ======================
   3. CÁC HÀM LOGIC
   ====================== */

function resetCopyText() {
    copyInfo.style.opacity = "1";
    copyInfo.style.transform = "translateY(0)";
    copiedInfo.style.opacity = "0";
    copiedInfo.style.transform = "translateY(20px)";
}

function displayResult(password) {
    resultEl.innerText = password;
}

function applySliderFill(slider) {
    const percentage = (100 * (slider.value - slider.min)) / (slider.max - slider.min);
    const bg = `linear-gradient(90deg, ${sliderProps.fill} ${percentage}%, ${sliderProps.background} ${percentage + 0.1}%)`;
    slider.style.background = bg;
}

function analyzePasswordStrength(password) {
    let score = 0;
    const suggestions = [];
    if (password.length === 0) return { score: 0, suggestions: [] };
    if (password.length < 8) { suggestions.push('<li style="color:#ef4444"><i class="fa-solid fa-xmark"></i> Quá ngắn</li>'); }
    else { score += 20; suggestions.push('<li style="color:#22c55e"><i class="fa-solid fa-check"></i> Độ dài tốt</li>'); }
    if (password.length >= 12) score += 20;
    if (/[A-Z]/.test(password)) { score += 15; suggestions.push('<li style="color:#22c55e"><i class="fa-solid fa-check"></i> Chữ hoa</li>'); }
    else { suggestions.push('<li style="color:#94a3b8"><i class="fa-regular fa-circle"></i> Thiếu chữ hoa</li>'); }
    if (/[0-9]/.test(password)) { score += 15; suggestions.push('<li style="color:#22c55e"><i class="fa-solid fa-check"></i> Số</li>'); }
    else { suggestions.push('<li style="color:#94a3b8"><i class="fa-regular fa-circle"></i> Thiếu số</li>'); }
    if (/[^A-Za-z0-9]/.test(password)) { score += 30; suggestions.push('<li style="color:#22c55e"><i class="fa-solid fa-check"></i> Ký tự đặc biệt</li>'); }
    else { suggestions.push('<li style="color:#94a3b8"><i class="fa-regular fa-circle"></i> Thiếu ký tự đặc biệt</li>'); }
    return { score: Math.min(score, 100), suggestions };
}

function updateStrengthUI(analysis) {
    strengthMeter.value = analysis.score;
    strengthSuggestions.innerHTML = analysis.suggestions.join("");
    let color = "#ef4444";
    if (analysis.score >= 50) color = "#eab308";
    if (analysis.score >= 80) color = "#22c55e";
    strengthMeter.style.setProperty("--progress-color", color);
}

function generatePassword(length, lower, upper, number, symbol) {
    let generatedPassword = "";
    const typesArr = [{ lower }, { upper }, { number }, { symbol }].filter(item => Object.values(item)[0]);
    if (typesArr.length === 0) return "";
    typesArr.forEach(type => { const funcName = Object.keys(type)[0]; generatedPassword += randomFunc[funcName](); });
    for (let i = generatedPassword.length; i < length; i++) {
        const type = typesArr[Math.floor(Math.random() * typesArr.length)];
        const funcName = Object.keys(type)[0];
        generatedPassword += randomFunc[funcName]();
    }
    return generatedPassword.split('').sort(() => 0.5 - Math.random()).join('');
}

function createAcronymFromSentence(sentence) {
    const words = sentence.split(/\s+/);
    let password = "";
    words.forEach(word => { if (word.length > 0) password += word[0]; });
    if (password.length < 8) password += Math.floor(Math.random() * 1000);
    return password;
}

function secureMathRandom() { return window.crypto.getRandomValues(new Uint32Array(1))[0] / (Math.pow(2, 32) - 1); }
function getRandomLower() { return String.fromCharCode(Math.floor(secureMathRandom() * 26) + 97); }
function getRandomUpper() { return String.fromCharCode(Math.floor(secureMathRandom() * 26) + 65); }
function getRandomNumber() { return String.fromCharCode(Math.floor(secureMathRandom() * 10) + 48); }
function getRandomSymbol() { const symbols = '~!@#$%^&*()_+{}":?><;.,'; return symbols[Math.floor(secureMathRandom() * symbols.length)]; }

// Khởi chạy màu slider ban đầu
applySliderFill(lengthEl);