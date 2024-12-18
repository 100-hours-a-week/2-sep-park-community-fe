//회원정보 비밀번호 수정 API
//import { API_URL } from '../../app.js';
document.addEventListener("DOMContentLoaded", async function () {
    // 정규 표현식: 비밀번호 유효성 검사
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;

    // DOM 요소 선택
    const passwordInput = document.getElementById("pw");
    const passwordCheckInput = document.getElementById("pwcheck");
    const pwCheckBtn = document.getElementById("pwCheckBtn");
    const pwHelper = document.getElementById("pwHelper"); // 비밀번호 도움말
    const pwCheckHelper = document.getElementById("pwHelperCheck"); // 비밀번호 확인 도움말
    // 비밀번호 유효성 검사
    function validatePassword() {
        const password = passwordInput.value;

        if (!passwordPattern.test(password)) {
            pwHelper.style.visibility = "visible";
            pwHelper.innerText = "비밀번호는 8~20자이며, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.";
            return false;
        }

        pwHelper.style.visibility = "hidden";
        return true;
    }

    // 비밀번호 확인 검사
    function validatePasswordCheck() {
        const password = passwordInput.value;
        const passwordCheck = passwordCheckInput.value;

        if (password !== passwordCheck) {
            pwCheckHelper.style.visibility = "visible";
            pwCheckHelper.innerText = "비밀번호와 비밀번호 확인이 일치하지 않습니다.";
            return false;
        }

        pwCheckHelper.style.visibility = "hidden";
        return true;
    }

    // 버튼 색상 업데이트
    function updateButtonColor() {
        const isPasswordValid = validatePassword();
        const isPasswordMatch = validatePasswordCheck();

        pwCheckBtn.style.backgroundColor = isPasswordValid && isPasswordMatch ? "#7F6AEE" : "#ACA0EB";
    }

    // 이벤트 리스너 등록
    [passwordInput, passwordCheckInput].forEach(input => {
        input.addEventListener("input", () => {
            validatePassword();
            validatePasswordCheck();
            updateButtonColor();
        });
    });

    // 세션 데이터 가져오기
    let userId;
    try {
        const response = await fetch(`${API_URL}auth/session`, {
            method: "GET",
            mode: "cors",
            credentials: "include", // 쿠키 포함
        });

        if (response.ok) {
            const data = await response.json();
            userId = data.user.id;
        } else {
            console.error("세션 데이터를 가져오는 데 실패했습니다.");
            return;
        }
    } catch (error) {
        console.error("세션 요청 중 오류 발생:", error.message);
        return;
    }

    // 비밀번호 변경 버튼 클릭 이벤트
    pwCheckBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        // 유효성 검사
        if (!validatePassword() || !validatePasswordCheck()) {
            alert("비밀번호를 확인해주세요!");
            return;
        }

        const newPassword = passwordInput.value;

        try {
            const response = await fetch(`${API_URL}/users/${userId}/password`, {
                method: "PUT",
                mode: "cors",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ password: newPassword }),
            });

            if (response.ok) {
                alert("비밀번호가 성공적으로 변경되었습니다.");
                console.log(await response.json());
                window.location.href = "/";
            } else {
                const errorData = await response.json();
                alert(`비밀번호 변경 실패: ${errorData.message || "알 수 없는 오류"}`);
                console.error("에러:", errorData);
            }
        } catch (error) {
            console.error("요청 중 오류 발생:", error.message);
            alert("비밀번호 변경 중 문제가 발생했습니다. 다시 시도해주세요.");
        }
    });
});
