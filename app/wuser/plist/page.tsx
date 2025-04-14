"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { REGDATE_STR, WR_STATE_ARR } from "@/app/utils";
import Navi from "@/components/Navi";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, MoreHorizontal, Search, Edit, Trash, Eye } from "lucide-react"

interface Reservation {
    wr_seq: number;
    wr_code: string;
    wr_tourdate: string;
    wr_shopnm: string;
    wr_optnm: string;
    wr_name: string;
    wr_tel: string;
    wr_totinwon: number;
    wr_totprice: number;
    wr_state: number;
    wr_regdate: string;
}

export default function Plist() {
    const router = useRouter();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

    

    useEffect(() => {
        const fetchReservations = async () => {
            const storedData = localStorage.getItem("ploginData");

            if (!storedData) {
                router.push("/plogin"); // 인증 정보가 없으면 로그인 페이지로 이동
                return;
            }

            const ploginData = JSON.parse(storedData);
            console.log("ploginData: ", ploginData)
            try {
                const res = await axios.post(`/api/wdm/plist`, ploginData);

                if (res.data.length > 0) {
                    setReservations(res.data);
                } else {
                    setError("예약 정보를 불러올 수 없습니다.");
                }
            } catch (err) {
                console.error("예약 목록 조회 오류:", err);
                setError("예약 목록을 가져오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchReservations();
    }, [router]);



    return (
        <div>

            <Navi />

            <main className="container mx-auto py-8 px-4" style={{ backgroundColor: "#ffffff", maxWidth: "1400px" }}>
                <div className="w-full">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">여행 예약 관리</h2>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="이름, 상품명 검색..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-gray-300">
                                    <TableHead className="w-[60px] text-center">번호</TableHead>
                                    <TableHead>여행일</TableHead>
                                    <TableHead className="min-w-[150px]">상품명</TableHead>
                                    <TableHead className="min-w-[120px]">옵션명</TableHead>
                                    <TableHead>이름</TableHead>
                                    <TableHead>연락처</TableHead>
                                    <TableHead className="text-center">총인원</TableHead>
                                    <TableHead className="text-right">결제금액</TableHead>
                                    <TableHead>진행상태</TableHead>
                                    <TableHead>등록일</TableHead>
                                    <TableHead className="text-center">관리</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reservations.length > 0 ? (
                                    reservations.map((item) => (
                                        <TableRow key={item.wr_seq} className="border-b border-gray-300">
                                            <TableCell className="text-center font-medium">{item.wr_seq}</TableCell>
                                            <TableCell>{item.wr_tourdate}</TableCell>
                                            <TableCell>{item.wr_shopnm}</TableCell>
                                            <TableCell>{item.wr_optnm}</TableCell>
                                            <TableCell>{item.wr_name}</TableCell>
                                            <TableCell>{item.wr_tel}</TableCell>
                                            <TableCell className="text-center">{item.wr_totinwon.toLocaleString()}명</TableCell>
                                            <TableCell className="text-right">{item.wr_totprice.toLocaleString()}</TableCell>
                                            <TableCell>{WR_STATE_ARR[item.wr_state]}</TableCell>
                                            <TableCell>{REGDATE_STR(item.wr_regdate)}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">메뉴 열기</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>작업</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="flex items-center">
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            <span><Link href={`/wuser/pview/${item.wr_code}`} className="btn btn-sm btn-primary mx-2">상세보기</Link></span>
                                                        </DropdownMenuItem>
                                                        {/* <DropdownMenuItem className="flex items-center">
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            <span>수정하기</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="flex items-center text-red-600">
                                                            <Trash className="mr-2 h-4 w-4" />
                                                            <span>삭제하기</span>
                                                        </DropdownMenuItem> */}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={11} className="h-24 text-center">
                                            검색 결과가 없습니다.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* 페이지네이션 */}
                    
                </div>
            </main>
        </div>
    );
}
