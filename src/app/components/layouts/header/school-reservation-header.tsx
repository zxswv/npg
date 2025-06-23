import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import {
  Calendar,
  Search,
  User,
  //   Phone,
  //   Mail,
  //   MapPin,
  Bell,
  Settings,
  LogOut,
  GraduationCap,
  Building,
  //   Clock,
  BookOpen,
  Users,
  Monitor,
} from "lucide-react";
import Link from "next/link";

export default function SchoolReservationHeader() {
  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        {/* Top bar with school info, 上部バーに学校情報 */}

        {/* Main header, メインヘッダー */}
        <div className="flex items-center justify-between py-4">
          {/* Logo and brand, ロゴとブランド */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                ClassroomBook(教室予約システム)
              </h1>
              <p className="text-sm text-muted-foreground">
                University Classroom Reservations(大学の教室予約)
              </p>
            </div>
          </div>

          {/* Navigation, ナビゲーション */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link
              href="/"
              className="text-sm font-medium hover:text-blue-600 transition-colors"
            >
              Dashboard(ダッシュボード)
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-sm font-medium hover:text-blue-600"
                >
                  <Building className="mr-2 h-4 w-4" />
                  {/* Buildings */}
                  建物
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  {/* Science Hall */}
                  科学館
                </DropdownMenuItem>
                <DropdownMenuItem>
                  {/* Engineering Building */}
                  工学棟 科学ホール
                </DropdownMenuItem>
                <DropdownMenuItem>Liberal Arts Center</DropdownMenuItem>
                <DropdownMenuItem>Business School</DropdownMenuItem>
                <DropdownMenuItem>Library Complex</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link
              href="/schedule"
              className="text-sm font-medium hover:text-blue-600 transition-colors"
            >
              <Calendar className="mr-2 h-4 w-4 inline" />
              {/* Schedule */}
              スケジュール
            </Link>
            <Link
              href="/resources"
              className="text-sm font-medium hover:text-blue-600 transition-colors"
            >
              <Monitor className="mr-2 h-4 w-4 inline" />
              Resources(リソース)
            </Link>
            <Link
              href="/reports"
              className="text-sm font-medium hover:text-blue-600 transition-colors"
            >
              <BookOpen className="mr-2 h-4 w-4 inline" />
              Reports(レポート)
            </Link>
          </nav>

          {/* Search and user actions, 検索とユーザー操作 */}
          <div className="flex items-center space-x-4">
            {/* Search, 検索 */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search rooms, buildings..."
                className="pl-10 w-72 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Quick stats, 主要な統計データ */}
            <div className="hidden xl:flex items-center space-x-4 px-4 py-2 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">24</div>
                <div className="text-xs text-muted-foreground">
                  Available(利用可能)
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-orange-600">8</div>
                <div className="text-xs text-muted-foreground">
                  In Use(使用中)
                </div>
              </div>
            </div>

            {/* Notifications, 通知 */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
                2
              </Badge>
            </Button>

            {/* User menu, ユーザーメニュー */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src="/placeholder.svg?height=40&width=40"
                      alt="User"
                    />
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      DR
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Dr. Sarah Johnson(サラ・ジョンソン)
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      Computer Science Department(コンピュータサイエンス学部)
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      sarah.johnson@university.edu(メール)
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile(プロフィール)</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>My Reservations(私の予約)</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Users className="mr-2 h-4 w-4" />
                  <span>Department Schedule</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Preferences</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Reserve Room CTA, 予約ルーム CTA */}
            <Button className="hidden sm:inline-flex bg-blue-600 hover:bg-blue-700">
              <Calendar className="mr-2 h-4 w-4" />
              Reserve Room(部屋を予約)
            </Button>
          </div>
        </div>

        {/* Quick filters bar, クイックフィルターバー */}
        <div className="flex items-center justify-between py-3 border-t bg-gray-50/50">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              Quick Filters:(クイックフィルター):
            </span>
            <Button variant="outline" size="sm" className="h-8">
              <Monitor className="mr-2 h-3 w-3" />
              Smart Classrooms(スマート教室)
            </Button>
            <Button variant="outline" size="sm" className="h-8">
              <Users className="mr-2 h-3 w-3" />
              Large Capacity (50+)
            </Button>
            <Button variant="outline" size="sm" className="h-8">
              Available Now(今すぐ利用可能)
            </Button>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Current Time:</span>
            <Badge variant="outline" className="font-mono">
              2:45 PM
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}
