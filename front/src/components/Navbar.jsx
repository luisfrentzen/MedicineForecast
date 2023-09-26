import logo from "../assets/Logo.png";

export default function Navbar() {
  return (
    <div className="w-100 flex justify-center items-center p-4 shadow-sm bg-white border-b-[1px]">
      <img src={logo} className="h-10 " alt="" />
    </div>
  );
}
