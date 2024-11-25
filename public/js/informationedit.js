// 요소 선택
const modalOpenButton = document.querySelector('.modalOpenButton'); // class 선택
const modalCloseButton = document.querySelector('.modalCloseButton'); // class 선택
const modal = document.querySelector('.modalContainer'); // class 선택
const profile = document.getElementById('infoProfile'); // id가 'infoProfile'인 요소
const emailElement = document.getElementById('emailInfo'); // email 정보를 표시할 요소

// 모달 열기 이벤트
modalOpenButton.addEventListener('click', () => {
    modal.classList.remove('hidden'); // 'hidden' 클래스 제거
});

// 모달 닫기 이벤트
modalCloseButton.addEventListener('click', () => {
    modal.classList.add('hidden'); // 'hidden' 클래스 추가
});

// 페이지 로드 시 동작
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // localStorage에서 프로필 이미지 경로 가져오기
        const profileImgPath = localStorage.getItem('profileImg');

        // 세션 데이터를 가져오기
        const response = await fetch('/api/session', { credentials: 'include' });
        if (response.ok) {
            const data = await response.json();

            // 세션에서 이메일 정보 가져오기
            const userEmail = data.user.email;

            // 이메일을 HTML 요소에 동적으로 삽입
            if (emailElement) {
                emailElement.innerText = userEmail;
            }
        } else {
            // 세션이 없거나 만료된 경우 기본 메시지 표시
            if (emailElement) {
                emailElement.innerText = '로그인 정보 없음';
            }
        }

        // 프로필 이미지 설정
        if (profile && profileImgPath) {
            profile.style.backgroundImage = `url(${profileImgPath})`;
            profile.style.backgroundSize = 'cover'; // 이미지를 꽉 채움
            profile.style.backgroundPosition = 'center'; // 중앙 정렬
        }
    } catch (error) {
        console.error('오류 발생:', error);
        if (emailElement) {
            emailElement.innerText = '오류 발생';
        }
    }
});