import { ORG } from "../config/orgInfo";

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white text-lg font-semibold mb-3 flex items-center gap-2">
              <img
                src="/logo.jpg"
                alt=""
                className="h-9 w-9 rounded-full object-cover"
              />
              {ORG.name}
            </h3>
            <p className="text-sm">{ORG.tagline}</p>
            <p className="text-sm mt-2">Reg. No: {ORG.registrationNo}</p>
          </div>
          <div>
            <h3 className="text-white text-lg font-semibold mb-3">Contact</h3>
            <p className="text-sm">{ORG.address}</p>
            <p className="text-sm mt-1">📧 {ORG.email}</p>
            <p className="text-sm mt-1">📞 {ORG.phone}</p>
          </div>
          <div>
            <h3 className="text-white text-lg font-semibold mb-3">Our Work</h3>
            <ul className="space-y-1">
              {ORG.works.map((work) => (
                <li key={work.title} className="text-sm">
                  {work.icon} {work.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm">
          <p> Built with ❤️ for the community by Kanai das / {ORG.name}</p>
        </div>
      </div>
    </footer>
  );
}
