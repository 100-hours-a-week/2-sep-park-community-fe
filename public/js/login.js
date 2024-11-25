document.addEventListener('DOMContentLoaded', () => {
    // 요소 가져오기
    const form = document.getElementById("loginForm");
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('pw');
    const loginButton = document.getElementById('loginButton');
    const signupButton = document.getElementById('signupButton');
    const helper = document.getElementById('helperText');

    // 정규표현식 패턴
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;

    // 유효성 검사에 따라 버튼 색상 업데이트
    emailInput.addEventListener('input', updateButtonColor);
    passwordInput.addEventListener('input', updateButtonColor);
    // 이메일 입력 시 헬퍼 텍스트 업데이트
    emailInput.addEventListener('change', updateHelperText);

    // 로그인 버튼 클릭 시 이벤트 처리
    loginButton.addEventListener('click', async (e) => {
        e.preventDefault(); // 기본 제출 동작 방지
        helper.style.visibility = 'hidden';
        helper.innerText = '';

        // 이메일과 비밀번호 유효성 검사
        if (validateEmail(emailInput.value) && validatePassword(passwordInput.value)) {
            const loginData = {
                email: emailInput.value,
                password: passwordInput.value,
            };

            try {
                // API 호출
                const response = await fetch("http://localhost:4000/auth/login", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(loginData),
                    credentials: 'include',
                });

                // 응답 처리
                if (response.ok) {
                    const data = await response.json();


                    if (data.user) {
                        // 프로필 이미지 저장
                        const profileImgPath = data.user.profileImg;
                        localStorage.setItem('profileImg', profileImgPath);
                        alert("로그인 성공");
                        window.location.href = '/posts';
                    } else {
                        alert("사용자 정보를 불러오지 못했습니다.");
                    }
                } else {
                    const errorData = await response.json();
                    showHelperText(errorData.message || '로그인에 실패했습니다.');
                }
            } catch (error) {
                console.error("Error during login:", error);
                alert("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
            }
        } else {
            showHelperText('이메일 또는 비밀번호 형식이 올바르지 않습니다.');
        }
    });

    // 회원가입 버튼 클릭 시 회원가입 페이지로 이동
    signupButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/signup';
    });

    // 버튼 색상 업데이트
    function updateButtonColor() {
        const emailValid = validateEmail(emailInput.value);
        const passwordValid = validatePassword(passwordInput.value);

        loginButton.style.backgroundColor = emailValid && passwordValid ? '#7F6AEE' : '#ACA0EB';
    }

    // 이메일 유효성 검사 실패 시 헬퍼 텍스트 업데이트
    function updateHelperText() {
        const emailValid = validateEmail(emailInput.value);
        const passwordEmpty = isPasswordEmpty(passwordInput.value);

        if (!emailValid) {
            showHelperText('올바른 이메일 주소 형식을 입력해주세요.');
        } else if (passwordEmpty) {
            showHelperText('비밀번호를 입력해주세요.');
        } else {
            hideHelperText();
        }
    }

    // 헬퍼 텍스트 표시
    function showHelperText(message) {
        helper.style.visibility = 'visible';
        helper.innerText = message;
    }

    // 헬퍼 텍스트 숨기기
    function hideHelperText() {
        helper.style.visibility = 'hidden';
        helper.innerText = '';
    }

    // 이메일 유효성 검사
    function validateEmail(email) {
        return emailPattern.test(email);
    }

    // 비밀번호 유효성 검사
    function validatePassword(password) {
        return passwordPattern.test(password);
    }

    // 비밀번호가 비어 있는지 검사
    function isPasswordEmpty(password) {
        return password.trim().length === 0;
    }
});
