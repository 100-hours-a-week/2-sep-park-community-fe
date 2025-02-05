//회원가입 API
//import { API_URL } from '../../app.js';
import API_URL from './config.js';
const form = document.getElementById("signupForm");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#pw");
const passwordCheckInput = document.querySelector("#pwcheck");
const nameInput = document.querySelector("#name");
const signupButton = document.getElementById("signupButton");
const backLoginButton = document.getElementById("backLoginButton");
const profileImg=document.getElementById("profileImage");
const circle = document.getElementById('circle'); // .circle 요소
const uploadText = document.getElementById('uploadText'); // "+" 텍스트
const fileInput = document.getElementById('fileUpload');
let openDialog = false; // 파일 선택 창 열림 여부 추적 변수
// 헬퍼 텍스트 요소
const emailHelper = document.getElementById("emailHelper");
const pwHelper = document.getElementById("pwHelper");
const pwCheckHelper = document.getElementById("pwCheckHelper");
const nameHelper = document.getElementById("nameHelper");
const arrow = document.getElementById("arrow");
const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;

// .circle을 클릭하면 파일 선택 창 열기
circle.addEventListener('click', function () {
    fileInput.value = ''; // 입력값 초기화
    openDialog = true; // 파일 선택 창 열림 상태 저장
    fileInput.click(); // 파일 선택 창 열기
});

// 파일 선택 후 이미지 업로드 처리
fileInput.addEventListener('change', function (event) {
    const file = event.target.files[0]; // 업로드된 파일 가져오기

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            circle.style.backgroundImage = `url('${e.target.result}')`;
            circle.style.backgroundColor = 'transparent'; // 기본 배경 제거
            uploadText.style.display = 'none'; // "+" 텍스트 숨기기
        };
        reader.readAsDataURL(file); // 파일 내용을 읽어 데이터 URL로 변환
    }

    openDialog = false; // 파일 선택 완료 시 파일 창 닫힘 상태로 설정
});

// 브라우저 포커스 복귀 시 파일 선택 취소 감지
window.addEventListener('focus', function () {
    if (openDialog && !fileInput.files.length) {
        resetCircle(); // 초기화 함수 호출
    }
    openDialog = false; // 항상 상태를 초기화
});

// .circle 초기화 함수
function resetCircle() {
    circle.style.backgroundImage = ''; // 배경 이미지 제거
    circle.style.backgroundColor = '#c4c4c4'; // 기본 배경 복원
    uploadText.style.display = 'block'; // "+" 텍스트 다시 표시
}



// 파일 선택 후 상태 업데이트
fileInput.addEventListener('change', function () {
    const profileHelper = document.getElementById("profileHelper");

    // 파일이 선택되었는지 확인
    if (fileInput.files[0]) {
        profileHelper.style.visibility = "hidden"; // 파일이 선택된 경우 숨김
    } else {
        profileHelper.style.visibility = "visible";
        profileHelper.innerText = "프로필을 추가해주세요"; // 파일이 없을 경우 메시지 표시
    }
});

document.addEventListener("DOMContentLoaded", function () {
    // 정규표현식 패턴 정의
// 입력할 때마다 유효성 검사 및 헬퍼 텍스트 업데이트
emailInput.addEventListener("input", validateEmail);
passwordInput.addEventListener("input", validatePassword);
passwordCheckInput.addEventListener("input", validatePasswordCheck);
nameInput.addEventListener("input", validateName);

    function validateEmail() {
        if (!emailPattern.test(emailInput.value)) {
            emailHelper.style.visibility = "visible";
            emailHelper.innerText = "올바른 이메일 주소 형식을 입력해주세요";
            return false;
        }
        emailHelper.style.visibility = "hidden";
        return true;
    }

    function validatePassword() {
        if (!passwordPattern.test(passwordInput.value)) {
            pwHelper.style.visibility = "visible";
            pwHelper.innerText = "비밀번호는 8~20자이며, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.";
            return false;
        }
        pwHelper.style.visibility = "hidden";
        return true;
    }

    function validatePasswordCheck() {
        if (passwordInput.value !== passwordCheckInput.value) {
            pwCheckHelper.style.visibility = "visible";
            pwCheckHelper.innerText = "비밀번호와 비밀번호 확인이 일치하지 않습니다.";
            return false;
        }
        pwCheckHelper.style.visibility = "hidden";
        return true;
    }

    function validateName() {
        if (nameInput.value.trim() === "" || nameInput.value.includes(" ") || nameInput.value.length > 10) {
            nameHelper.style.visibility = "visible";
            nameHelper.innerText = "닉네임은 공백 없이 10글자 이내로 입력해야 합니다.";
            return false;
        }
        nameHelper.style.visibility = "hidden";
        return true;
    }
// 입력할 때마다 버튼 색상 업데이트
    emailInput.addEventListener("input", updateButtonColor);
    passwordInput.addEventListener("input", updateButtonColor);
    passwordCheckInput.addEventListener("input", updateButtonColor);
    nameInput.addEventListener("input", updateButtonColor);
    // 유효성 검사에 따라 버튼 색상 업데이트 함수
    function updateButtonColor() {
        const emailCheck = validateEmail();
        const passwordCheck = validatePassword();
        const passwordMatchCheck = validatePasswordCheck();
        const nameCheck = validateName();

        if (emailCheck && passwordCheck && passwordMatchCheck && nameCheck) {
            signupButton.style.backgroundColor = "#7F6AEE"; // 유효할 때 색상
        } else {
            signupButton.style.backgroundColor = "#ACA0EB"; // 유효하지 않을 때 색상
        }
    }



    // 로그인 창 이동 버튼
    backLoginButton.addEventListener("click", (e) => {
        window.location.href = "/";
    });

    // 애로우 이동 버튼
    arrow.addEventListener("click", (e) => {
        window.location.href = "/";
    });


    // 회원가입 버튼 클릭 시 검증
    signupButton.addEventListener("click", async function (e) {
        e.preventDefault();

        const profileHelper = document.getElementById("profileHelper");

        // 파일 확인
        if (!fileInput.files[0]) {
            profileHelper.style.visibility = "visible";
            profileHelper.innerText = "프로필을 추가해주세요";
            return;
        }

        // 유효성 검사
        const emailCheck = validateEmail();
        const passwordCheck = validatePassword();
        const passwordMatchCheck = validatePasswordCheck();
        const nameCheck = validateName();

        if (!(emailCheck && passwordCheck && passwordMatchCheck && nameCheck)) {
            return;
        }

        try {
            //Presigned URL 요청
            const file = fileInput.files[0];
            const response = await fetch(`${API_URL}/auth/presigned-url?fileName=${encodeURIComponent(file.name)}&fileType=${encodeURIComponent(file.type)}`);
            const { uploadUrl, fileUrl } = await response.json();

            //Presigned URL을 사용해 S3에 직접 업로드
            const uploadResponse = await fetch(uploadUrl, {
                method: "PUT",
                //headers: { "Content-Type": file.type },
                body: file,
            });

            if (!uploadResponse.ok) {
                throw new Error("파일 업로드 실패");
            }

            // 3️⃣ 회원가입 요청 (파일을 서버에 보내지 않고, 업로드된 S3 URL을 전송)
            const signupData = {
                email: emailInput.value,
                password: passwordInput.value,
                name: nameInput.value,
                profileImageUrl: fileUrl, // 업로드된 S3 URL만 전송
            };

            const signupResponse = await fetch(`${API_URL}/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(signupData),
            });

            if (signupResponse.ok) {
                alert("회원가입이 완료되었습니다.");
                window.location.href = "/";
            } else {
                const errorData = await signupResponse.json();
                alert(errorData.message || "회원가입 실패");
            }
        } catch (error) {
            console.error("회원가입 중 오류:", error);
            alert("회원가입 중 문제가 발생했습니다.");
        }
    });
});