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
export const WR_STATE_ARR: { [key: number]: string } = {
    1: "예약접수",
    2: "예약완료",
};
export const WR_GENDER_ARR: { [key: string]: string } = {
    "M": "남",
    "W": "여",
};
