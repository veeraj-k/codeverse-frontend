import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroImg from "/src/assets/codeverse-hero.svg";
import TestimonialAvatar from "../components/TestimonialAvatar";

const Dashboard = () => {
  // Animation  variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-base-100 text-base-content transition-colors duration-300">
      {/* Hero Section with Parallax Effect */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 animate-gradient" />
        <div className="hero min-h-screen relative">
          <div className="hero-content flex-col lg:flex-row-reverse gap-16 max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:w-1/2"
            >
              <img
                src={heroImg}
                className="w-full rounded-xl shadow-2xl border-4 border-base-content/10 hover:border-primary/30 transition-all duration-300"
                alt="CodeVerse Hero"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:w-1/2 text-center lg:text-left"
            >
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Welcome to <span className="text-yellow-400">CodeVerse</span>
              </h1>
              <p className="text-xl mb-8 text-base-content/80">
                Elevate your coding skills with our cutting-edge platform. Practice, compete, and grow with a community of passionate developers.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link to="/problems" className="btn btn-primary btn-lg shadow-lg hover:scale-105 transition-all duration-300">
                  Start Coding
                </Link>
                <Link to="/contests" className="btn btn-outline btn-lg hover:btn-secondary transition-all duration-300">
                  Join Contests
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-20 bg-base-200"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "10K+", label: "Active Users" },
              { number: "500+", label: "Problems" },
              { number: "50+", label: "Contests" },
              { number: "95%", label: "Success Rate" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-xl bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <h3 className="text-4xl font-bold text-primary mb-2">{stat.number}</h3>
                <p className="text-base-content/70">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-16"
          >
            Why Choose <span className="text-primary">CodeVerse?</span>
          </motion.h2>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
          >
            {[
              {
                icon: "⚡",
                title: "Real-time Code Execution",
                desc: "Experience lightning-fast code execution with our optimized infrastructure.",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: "📊",
                title: "Advanced Analytics",
                desc: "Track your progress with detailed analytics and personalized insights.",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: "🤝",
                title: "Community Driven",
                desc: "Join a vibrant community of developers and learn together.",
                color: "from-orange-500 to-red-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="card-body">
                  <div className={`text-5xl mb-4 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                    {feature.icon}
                  </div>
                  <h3 className="card-title text-xl mb-2">{feature.title}</h3>
                  <p className="text-base-content/70">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Learning Path Section */}
      <section className="py-20 bg-base-200">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-16"
          >
            Your Learning Journey
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Start Coding", desc: "Begin with basic problems" },
              { step: "02", title: "Practice Daily", desc: "Build your skills" },
              { step: "03", title: "Join Contests", desc: "Test your abilities" },
              { step: "04", title: "Master Skills", desc: "Become an expert" }
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative p-6 rounded-xl bg-base-100 shadow-lg"
              >
                <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold mt-4 mb-2">{step.title}</h3>
                <p className="text-base-content/70">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-16"
          >
            What Our Users Say
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "CodeVerse helped me land my dream job at a top tech company!",
                author: "Sarah Chen",
                role: "Software Engineer",
                company: "Tech Corp",
                color: "#4a9eff"
              },
              {
                quote: "The best platform for practicing coding interviews.",
                author: "Michael Rodriguez",
                role: "Full Stack Developer",
                company: "StartupX",
                color: "#ff5f56"
              },
              {
                quote: "Amazing community and learning resources!",
                author: "Priya Patel",
                role: "Backend Developer",
                company: "InnovateTech",
                color: "#27c93f"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="card-body">
                  <div className="flex items-center gap-4 mb-4">
                    <TestimonialAvatar name={testimonial.author} color={testimonial.color} />
                    <div>
                      <h4 className="font-bold">{testimonial.author}</h4>
                      <p className="text-sm text-base-content/70">{testimonial.role} at {testimonial.company}</p>
                    </div>
                  </div>
                  <p className="text-lg italic">"{testimonial.quote}"</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-base-200">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="card bg-base-100 shadow-2xl p-12"
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Start Your Coding Journey?</h2>
            <p className="text-xl mb-8 text-base-content/70 max-w-2xl mx-auto">
              Join thousands of developers who are already improving their skills with CodeVerse.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/problems" className="btn btn-primary btn-lg shadow-lg hover:scale-105 transition-all duration-300">
                Start Coding Now
              </Link>
              <Link to="/contests" className="btn btn-outline btn-lg hover:btn-secondary transition-all duration-300">
                View Contests
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
