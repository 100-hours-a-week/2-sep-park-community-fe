//import { API_URL } from '../../app.js';
import API_URL from './config.js';
document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소 선택
    const profile = document.querySelector('.headerInner .profile'); // 프로필 이미지 클릭 영역
    const menu = document.querySelector('.menu'); // 메뉴 영역
    const pwd = document.querySelector('.pwd'); // 비밀번호 변경
    const logout = document.querySelector('.logout'); // 로그아웃
    const info = document.querySelector('.menu .profile'); // 정보 수정
    const arrow = document.querySelector('.arrow'); // 뒤로 가기 화살표

    // 프로필 이미지 렌더링 (localStorage에서 가져오기)
    const profileImgPath = localStorage.getItem('profileImg');
    if (profile && profileImgPath) {
        profile.style.backgroundImage = `url(${profileImgPath})`;
        profile.style.backgroundSize = 'cover'; // 이미지를 꽉 채움
        profile.style.backgroundPosition = 'center'; // 중앙 정렬
    }

    // 메뉴 토글 (프로필 클릭 시)
    if (profile) {
        profile.addEventListener('click', () => {
            menu.classList.toggle('visible'); // visible 클래스 추가/제거
        });
    }

    // 뒤로 가기 화살표 클릭 시
    if (arrow) {
        arrow.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/posts';
        });
    }

    // 정보 수정 (프로필 메뉴에서)
    if (info) {
        info.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/users/editinfo';
        });
    }

    // 비밀번호 변경
    if (pwd) {
        pwd.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/users/pwedit';
        });
    }

    // 로그아웃
    if (logout) {
        logout.addEventListener('click', async () => {
            const response = await fetch(`${API_URL}/users/logout`, { method: 'POST', credentials: 'include' });
            if (response.ok) {
                alert('로그아웃 성공');
                window.location.href = '/';
            } else {
                alert('로그아웃에 실패했습니다.');
            }
        });
    }
});
