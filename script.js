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
const lengthValueEl = document.getElementById("length-val"); // Đã sửa lại ID cho khớp với HTML mới

const uppercaseEl = document.getElementById("uppercase");
const lowercaseEl = document.getElementById("lowercase");
const numberEl = document.getElementById("number");
const symbolEl = document.getElementById("symbol");

const generateBtn = document.getElementById("generate");
const copyBtn = document.getElementById("copy-btn");
const copyInfo = document.querySelector(".result__info.right"); // Sửa lại selector cho khớp
const copiedInfo = document.querySelector(".result__info.left"); // Sửa lại selector cho khớp
const resultContainer = document.querySelector(".result"); // Sửa lại class cho khớp

// --- DOM cho Acronym ---
const passphraseInput = document.getElementById("passphraseInput");
const generateAcronymBtn = document.getElementById("generateAcronym");

// --- [QUAN TRỌNG] Biến trạng thái (Đã thêm mới để sửa lỗi) ---
const sliderProps = {
    fill: "#3b82f6",
    background: "#334155",
};

// Biến theo dõi trạng thái để nút copy hoạt động
let generatedPassword = false;

// Biến lưu tọa độ khung kết quả để tính toán vị trí chuột
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

// 2. Nhập liệu để kiểm tra độ mạnh
passwordInput.addEventListener("input", () => {
    const password = passwordInput.value;
    const analysis = analyzePasswordStrength(password);
    updateStrengthUI(analysis);
});

// 3. Slider thay đổi giá trị
lengthEl.addEventListener("input", (event) => {
    // Cập nhật số hiển thị
    if(lengthValueEl) lengthValueEl.innerText = event.target.value;
    applySliderFill(event.target);
});

// 4. Click nút Sinh Mật Khẩu (Random)
generateBtn.addEventListener("click", () => {
    const length = +lengthEl.value;
    const hasLower = lowercaseEl.checked;
    const hasUpper = uppercaseEl.checked;
    const hasNumber = numberEl.checked;
    const hasSymbol = symbolEl.checked;

    const password = generatePassword(length, hasLower, hasUpper, hasNumber, hasSymbol);

    // Đánh dấu là đã có mật khẩu để nút copy hiện lên
    generatedPassword = true;
    displayResult(password);
    resetCopyText(); // Reset chữ "Đã sao chép" về "Nhấp chuột..."
});

// 5. Click nút Tạo Acronym (Từ câu nói)
generateAcronymBtn.addEventListener("click", () => {
    const sentence = passphraseInput.value.trim();
    if (!sentence) {
        alert("Vui lòng nhập một câu!");
        return;
    }
    const password = createAcronymFromSentence(sentence);

    // Đánh dấu là đã có mật khẩu
    generatedPassword = true;
    displayResult(password);
    resetCopyText();
});

// 6. Logic Nút Copy Bám Theo Chuột
// Cập nhật tọa độ khi resize màn hình
window.addEventListener("resize", (e) => {
    resultContainerBound = {
        left: resultContainer.getBoundingClientRect().left,
        top: resultContainer.getBoundingClientRect().top,
    };
});

// Di chuột trên box kết quả
resultContainer.addEventListener("mousemove", (e) => {
    // Cập nhật lại bound đề phòng scroll
    resultContainerBound = {
        left: resultContainer.getBoundingClientRect().left,
        top: resultContainer.getBoundingClientRect().top,
    };

    if (generatedPassword) {
        copyBtn.style.opacity = "1";
        copyBtn.style.pointerEvents = "all";
        // Tính toán vị trí chuột tương đối trong khung
        copyBtn.style.setProperty("--x", `${e.clientX - resultContainerBound.left}px`);
        copyBtn.style.setProperty("--y", `${e.clientY - resultContainerBound.top}px`);
    } else {
        copyBtn.style.opacity = "0";
        copyBtn.style.pointerEvents = "none";
    }
});

// Click nút "Copy"
copyBtn.addEventListener("click", () => {
    const password = resultEl.innerText;

    if (!password || password == "CLICK GENERATE") {
        return;
    }

    // Sử dụng Clipboard API hiện đại thay vì execCommand cũ
    navigator.clipboard.writeText(password).then(() => {
        // Hiệu ứng text sau khi copy
        copyInfo.style.opacity = "0";
        copyInfo.style.transform = "translateY(-20px)";

        copiedInfo.style.opacity = "1";
        copiedInfo.style.transform = "translateY(0)";

        // Đổi màu nút xanh báo hiệu
        copyBtn.style.background = "#2ecc71";
        copyBtn.style.color = "white";

        // Reset sau 2 giây
        setTimeout(() => {
            resetCopyText();
            copyBtn.style.background = "white";
            copyBtn.style.color = "#0a0e30";
        }, 2000);
    });
});

// Ngăn người dùng bỏ chọn tất cả checkbox
[uppercaseEl, lowercaseEl, numberEl, symbolEl].forEach(el => {
    el.addEventListener('click', () => {
        const checkedCount = [uppercaseEl, lowercaseEl, numberEl, symbolEl].filter(x => x.checked).length;
        if (checkedCount === 0) {
            el.checked = true; // Bắt buộc giữ lại 1 cái
        }
    });
});

/* ======================
   3. CÁC HÀM LOGIC
   ====================== */

// Helper reset text copy
function resetCopyText() {
    copyInfo.style.opacity = "1";
    copyInfo.style.transform = "translateY(0)";
    copiedInfo.style.opacity = "0";
    copiedInfo.style.transform = "translateY(20px)";
}

// Hiển thị kết quả ra màn hình
function displayResult(password) {
    resultEl.innerText = password;
}

// Logic Slider Fill màu
function applySliderFill(slider) {
    const percentage = (100 * (slider.value - slider.min)) / (slider.max - slider.min);
    const bg = `linear-gradient(90deg, ${sliderProps.fill} ${percentage}%, ${sliderProps.background} ${percentage + 0.1}%)`;
    slider.style.background = bg;
}

// --- LOGIC KIỂM TRA ĐỘ MẠNH ---
function analyzePasswordStrength(password) {
    let score = 0;
    const suggestions = [];

    if (password.length === 0) return { score: 0, suggestions: [] };

    // 1. Độ dài
    if (password.length < 8) {
        suggestions.push('<li style="color:#ef4444"><i class="fa-solid fa-xmark"></i> Quá ngắn (tối thiểu 8 ký tự)</li>');
    } else {
        score += 20;
        suggestions.push('<li style="color:#22c55e"><i class="fa-solid fa-check"></i> Độ dài tốt</li>');
    }
    if (password.length >= 12) score += 20;

    // 2. Chữ hoa
    if (/[A-Z]/.test(password)) {
        score += 15;
        suggestions.push('<li style="color:#22c55e"><i class="fa-solid fa-check"></i> Có chữ hoa</li>');
    } else {
        suggestions.push('<li style="color:#94a3b8"><i class="fa-regular fa-circle"></i> Thiếu chữ hoa</li>');
    }

    // 3. Số
    if (/[0-9]/.test(password)) {
        score += 15;
        suggestions.push('<li style="color:#22c55e"><i class="fa-solid fa-check"></i> Có số</li>');
    } else {
        suggestions.push('<li style="color:#94a3b8"><i class="fa-regular fa-circle"></i> Thiếu số</li>');
    }

    // 4. Ký tự đặc biệt
    if (/[^A-Za-z0-9]/.test(password)) {
        score += 30;
        suggestions.push('<li style="color:#22c55e"><i class="fa-solid fa-check"></i> Có ký tự đặc biệt</li>');
    } else {
        suggestions.push('<li style="color:#94a3b8"><i class="fa-regular fa-circle"></i> Thiếu ký tự đặc biệt</li>');
    }

    return { score: Math.min(score, 100), suggestions };
}

function updateStrengthUI(analysis) {
    strengthMeter.value = analysis.score;
    strengthSuggestions.innerHTML = analysis.suggestions.join("");

    // Đổi màu thanh progress dựa trên điểm
    let color = "#ef4444"; // Đỏ
    if (analysis.score >= 50) color = "#eab308"; // Vàng
    if (analysis.score >= 80) color = "#22c55e"; // Xanh lá

    strengthMeter.style.setProperty("--progress-color", color);
}

// --- LOGIC SINH MẬT KHẨU ---
function generatePassword(length, lower, upper, number, symbol) {
    let generatedPassword = "";
    const typesArr = [{ lower }, { upper }, { number }, { symbol }].filter(item => Object.values(item)[0]);

    if (typesArr.length === 0) return "";

    // Đảm bảo mỗi loại có ít nhất 1 ký tự
    typesArr.forEach(type => {
        const funcName = Object.keys(type)[0];
        generatedPassword += randomFunc[funcName]();
    });

    // Điền phần còn lại
    for (let i = generatedPassword.length; i < length; i++) {
        const type = typesArr[Math.floor(Math.random() * typesArr.length)];
        const funcName = Object.keys(type)[0];
        generatedPassword += randomFunc[funcName]();
    }

    // Trộn ký tự (Shuffle)
    return generatedPassword.split('').sort(() => 0.5 - Math.random()).join('');
}

function createAcronymFromSentence(sentence) {
    const words = sentence.split(/\s+/);
    let password = "";
    words.forEach(word => {
        if (word.length > 0) password += word[0];
    });

    // Nếu ngắn quá (<8), thêm số ngẫu nhiên vào cuối cho an toàn
    if (password.length < 8) {
        password += Math.floor(Math.random() * 1000);
    }
    return password;
}

// --- HÀM RANDOM AN TOÀN ---
function secureMathRandom() {
    return window.crypto.getRandomValues(new Uint32Array(1))[0] / (Math.pow(2, 32) - 1);
}

function getRandomLower() {
    return String.fromCharCode(Math.floor(secureMathRandom() * 26) + 97);
}
function getRandomUpper() {
    return String.fromCharCode(Math.floor(secureMathRandom() * 26) + 65);
}
function getRandomNumber() {
    return String.fromCharCode(Math.floor(secureMathRandom() * 10) + 48);
}
function getRandomSymbol() {
    const symbols = '~!@#$%^&*()_+{}":?><;.,';
    return symbols[Math.floor(secureMathRandom() * symbols.length)];
}

// Khởi chạy màu slider ban đầu
applySliderFill(lengthEl);