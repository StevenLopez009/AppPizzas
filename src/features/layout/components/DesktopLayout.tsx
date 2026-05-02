/*import CheckoutUI from "@/features/orders/pages/Checkout";
import OrderPage from "@/features/orders/pages/OrderPage";*/

import CheckoutUI from "@/src/app/orders/checkout/page";
import Orders from "@/src/app/orders/page";
import OrderPage from "../../orders/pages/OrderPage";
import SidebarContainer from "./SideBarContainer";

export default function DesktopLayout({
  children,
  menu,
  title,
  showOrder,
  showOrderPage,
}: any) {
  return (
    <div className="hidden md:grid w-full grid-cols-[250px_1fr_350px] overflow-hidden">
      {/* Sidebar */}
      <div className="h-screen border-r">
        <SidebarContainer menu={menu} title={title} />
      </div>

      {/* Main */}
      <main className="min-w-0 p-4 overflow-x-auto">{children}</main>

      {/* Right Panel */}
      <div className="h-screen overflow-y-auto border-l">
        {showOrderPage && <OrderPage />}
        {!showOrderPage && !showOrder && <Orders />}
        {!showOrderPage && showOrder && <CheckoutUI />}
      </div>
    </div>
  );
}
