import CheckoutHeader from "./CheckoutHeader";
import CheckoutLocationCard from "./CheckoutLocationCard";
import CustomerForm from "./CustomerForm";
import PaymentSection from "./PaymentSection";
import CheckoutFooter from "./CheckoutFooter";

export default function CheckoutView(props: any) {
  return (
    <div className="w-full max-w-md md:max-w-none mx-auto bg-gray-50 min-h-screen flex flex-col">
      <CheckoutHeader />

      <div className="flex-1">
        <CheckoutLocationCard
          orderType={props.orderType}
          location={props.location}
          locating={props.locating}
          savedLocation={props.savedLocation}
          getLocation={props.getLocation}
          saveLocation={props.saveLocation}
          clearSavedLocation={props.clearSavedLocation}
          sendRestaurantLocation={props.sendRestaurantLocation}
        />

        <CustomerForm {...props} />

        <PaymentSection {...props} />
      </div>

      <CheckoutFooter total={props.total} subtotal={props.subtotal} domicilio={props.domicilio} onSubmit={props.handleSubmit} />
    </div>
  );
}
