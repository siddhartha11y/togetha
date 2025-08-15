import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Feed from "../components/Feed";

export default function HomePage() {
  return (
    <div className="bg-black min-h-screen font-sans text-white">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="ml-[256px] pt-[64px] flex-grow flex justify-center">
          <Feed />
        </div>
      </div>
    </div>
  );
}
