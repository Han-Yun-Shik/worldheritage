export const REGDATE_STR = (dateStr: string): string => {
    if (!dateStr || dateStr.length < 8) return "";

    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);

    return `${year}-${month}-${day}`;
};
export const REGDATE_YMD_STR = (dateStr: string): string => {
    if (!dateStr) return "";

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const weekday = ["일", "월", "화", "수", "목", "금", "토"];
    const dayOfWeek = weekday[date.getDay()];

    return `${year}년 ${month}월 ${day}일 (${dayOfWeek})`;
};

export const FORMATAUTHDATE = (authDate: string): string => {
    if (authDate.length !== 12) return authDate; // 형식이 이상하면 그대로 반환

    const year = '20' + authDate.slice(0, 2); // 25 → 2025
    const month = authDate.slice(2, 4);
    const day = authDate.slice(4, 6);
    const hour = authDate.slice(6, 8);
    const minute = authDate.slice(8, 10);
    const second = authDate.slice(10, 12);

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

export const FORMATCANCELDATE = (date: string, time: string): string => {
    if (!date || !time || date.length !== 8 || time.length !== 6) return '';

    const year = date.slice(0, 4);
    const month = date.slice(4, 6);
    const day = date.slice(6, 8);

    const hour = time.slice(0, 2);
    const minute = time.slice(2, 4);
    const second = time.slice(4, 6);

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

export const WR_STATE_ARR: { [key: number]: string } = {
    1: "예약접수",
    2: "결제완료",
    3: "결제취소",
};
export const WR_GENDER_ARR: { [key: string]: string } = {
    "M": "남",
    "W": "여",
};

export const getStateButtonClass = (state: number) => {
    switch (state) {
        case 1:
            return "bg-green-500 hover:bg-green-600 text-white";
        case 2:
            return "bg-blue-500 hover:bg-blue-600 text-white";
        case 3:
            return "bg-red-300 hover:bg-red-300 text-white";
        default:
            return "bg-gray-300 text-gray-700";
    }
};
