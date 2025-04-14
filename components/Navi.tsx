// components/Nabi.tsx
import Link from "next/link";

export default function Navi() {
  return (
    <>
      <div className="w_u_navi_wrap">
        <Link href="/" className="w_t_btn">
          Home
        </Link>
        {/* <Link href="/wuser/ulist" className="w_t_btn">
          상품목록
        </Link> */}
        <Link href="/wuser/plogin" className="w_t_btn">
          예약확인
        </Link>
        <Link href="/wdm/slist" className="w_t_btn">
          관리설정
        </Link>
      </div>
    </>
  );
}
