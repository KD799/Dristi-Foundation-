import { Link } from "react-router-dom";
import { ORG } from "../../config/orgInfo";

const initiatives = [
  {
    title: "Education for All",
    description:
      "We support students through free book distribution initiatives, helping them access educational resources and pursue their studies with greater confidence.",
    icon: "📚",
  },
  {
    title: "Eye-Care Awareness",
    description:
      "We support free eye-checkup campaigns to encourage eye-health awareness and help community members access basic eye-care services.",
    icon: "👁️",
  },
  {
    title: "Flood Relief and Community Support",
    description:
      "During floods and other challenging situations, we aim to support affected individuals and families through relief activities and community assistance.",
    icon: "🌊",
  },
];

export default function About() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-r from-indigo-600 to-indigo-800 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            About {ORG.name}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-indigo-100">
            Working Together for a Better Tomorrow
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold text-gray-900">
            Working Together for a Better Tomorrow
          </h2>
          <p className="mb-6 text-lg leading-relaxed text-gray-600">
            {ORG.name} is a non-profit organization based in {ORG.address},
            committed to serving communities and supporting people in need
            through social welfare initiatives. We believe that everyone
            deserves access to education, basic healthcare, and support during
            difficult times.
          </p>
          <p className="text-lg leading-relaxed text-gray-600">
            Our work focuses on creating positive change at the grassroots
            level through community participation, compassion, and collective
            action. We aim to make a meaningful difference in people&apos;s lives
            by addressing local needs and extending a helping hand to those who
            need it most.
          </p>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold text-gray-900">Our Mission</h2>
          <p className="text-lg leading-relaxed text-gray-600">
            Our mission is to contribute to a healthier, more educated, and
            more supportive society by making essential resources and community
            assistance more accessible to people in need.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            What We Do
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {initiatives.map((initiative) => (
              <article
                key={initiative.title}
                className="rounded-xl bg-white p-8 shadow-md transition-shadow hover:shadow-lg"
              >
                <div className="mb-4 text-5xl" aria-hidden="true">
                  {initiative.icon}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  {initiative.title}
                </h3>
                <p className="text-gray-600">{initiative.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold text-gray-900">Our Vision</h2>
          <p className="text-lg leading-relaxed text-gray-600">
            We envision a society where every individual has the opportunity to
            learn, maintain their well-being, and live with dignity. Through
            local initiatives and community involvement, we strive to build a
            stronger and more compassionate future for everyone.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">
            Join Us in Making a Difference
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-gray-600">
            Positive change begins when people come together for a common
            cause. We welcome community participation and support for
            initiatives that benefit those in need.
          </p>
          <p className="mb-8 text-lg leading-relaxed text-gray-600">
            Together, we can help create a community where kindness leads to
            action and every contribution makes a difference.
          </p>
          <Link
            to="/signup"
            className="inline-block rounded-lg bg-indigo-700 px-8 py-3 font-semibold text-white transition-colors hover:bg-indigo-800"
          >
            Get Involved
          </Link>
          <p className="mt-10 font-semibold text-indigo-800">
            Dristi Foundation — Serving the Community, Supporting Lives.
          </p>
        </div>
      </section>
    </div>
  );
}
