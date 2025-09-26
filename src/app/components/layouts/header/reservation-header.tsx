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
  Phone,
  Mail,
  MapPin,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";

export default function ReservationHeader() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4">
        {/* Top bar with contact info */}
        <div className="flex items-center justify-between py-2 text-sm text-muted-foreground border-b">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>(555) 123-4567</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>reservations@restaurant.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>123 Main St, City, State</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Open Now
            </Badge>
            <span>Mon-Sun: 11:00 AM - 10:00 PM</span>
          </div>
        </div>

        {/* Main header, メインヘッダー */}
        <div className="flex items-center justify-between py-4">
          {/* Logo and brand, ロゴとブランド */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <Calendar className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                ReserveTable(テーブル予約)
              </h1>
              <p className="text-sm text-muted-foreground">
                高級レストランでの食事体験
              </p>
            </div>
          </div>

          {/* Navigation, ナビゲーション */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Home(ホーム)
            </Link>
            <Link
              href="/menu"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Menu(メニュー)
            </Link>
            <Link
              href="/reservations"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Reservations(予約)
            </Link>
            <Link
              href="/events"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Private Events(プライベートイベント)
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              About(アバウト)
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Contact(お問い合わせ)
            </Link>
          </nav>

          {/* Search and user actions, 検索とユーザー操作ホーム */}
          <div className="flex items-center space-x-4">
            {/* Search, 検索 */}
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search reservations..."
                className="pl-10 w-64"
              />
            </div>

            {/* Notifications, 通知 */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                3
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
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      John Doe(ジョン・ドウ)
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      john.doe@example.com
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
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings(設定)</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out(ログアウト)</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Book Now CTA, 今すぐ予約 CTA */}
            <Button className="hidden sm:inline-flex">
              <Calendar className="mr-2 h-4 w-4" />
              Book Now(今すぐ予約)
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
