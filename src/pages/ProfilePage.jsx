import React from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaCode, FaLaptopCode, FaServer, FaDatabase, FaDocker, FaAws, FaPython, FaJava } from 'react-icons/fa';
import { SiDjango, SiFlask, SiMysql, SiSpringboot, SiNodedotjs } from 'react-icons/si';

const ProfilePage = () => {
  const developers = [
    {
      name: "Vinay Gopal P",
      role: "Full Stack Developer",
      github: "https://github.com/vinaygopalp",
      linkedin: "https://www.linkedin.com/in/vinay-gopal-p/",
      avatar: "https://avatars.githubusercontent.com/vinaygopalp",
      skills: [
        { name: "Django", icon: <SiDjango className="text-green-600" /> },
        { name: "Flask", icon: <SiFlask className="text-gray-800" /> },
        { name: "Python", icon: <FaPython className="text-blue-600" /> },
        { name: "MySQL", icon: <SiMysql className="text-blue-500" /> },
        { name: "Docker", icon: <FaDocker className="text-blue-400" /> },
        { name: "React", icon: <FaCode className="text-blue-500" /> },
        { name: "REST APIs", icon: <FaServer className="text-purple-500" /> }
      ],
      bio: "Passionate full-stack developer with expertise in Python web development and cloud technologies. Specializes in Django, Flask, and containerization with Docker. Experienced in building scalable web applications and RESTful APIs.",
      achievements: [
        "Developed multiple full-stack applications using Django and Flask",
        "Implemented containerized solutions using Docker",
        "Built and optimized MySQL databases for high-performance applications",
        "Created RESTful APIs for various client applications",
        "Contributor to open-source Python projects"
      ],
      expertise: [
        "Backend Development",
        "Database Design",
        "API Development",
        "Containerization",
        "System Architecture"
      ]
    },
    {
      name: "Veeraj K",
      role: "Backend Developer",
      github: "https://github.com/veeraj-k",
      linkedin: "https://www.linkedin.com/in/veeraj-k-574280202/",
      avatar: "https://avatars.githubusercontent.com/veeraj-k",
      skills: [
        { name: "Node.js", icon: <SiNodedotjs className="text-green-600" /> },
        { name: "Spring Boot", icon: <SiSpringboot className="text-green-500" /> },
        { name: "Python", icon: <FaPython className="text-blue-600" /> },
        { name: "MySQL", icon: <SiMysql className="text-blue-500" /> },
        { name: "Docker", icon: <FaDocker className="text-blue-400" /> },
        { name: "AWS", icon: <FaAws className="text-orange-500" /> },
        { name: "Java", icon: <FaJava className="text-red-500" /> }
      ],
      bio: "Backend specialist with a strong foundation in Java, Spring Boot, and Node.js. Experienced in cloud architecture using AWS and containerization with Docker. Proficient in building robust and scalable server-side applications.",
      achievements: [
        "Developed enterprise-level applications using Spring Boot",
        "Implemented cloud solutions using AWS services",
        "Created microservices architecture using Node.js",
        "Expert in database optimization and scaling",
        "Proficient in CI/CD pipeline implementation"
      ],
      expertise: [
        "Cloud Architecture",
        "Microservices",
        "DevOps",
        "Database Optimization",
        "System Design"
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-base-200 pt-20 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4"
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 bg-clip-text text-transparent leading-relaxed"
        >
          Meet Our Developers
        </motion.h1>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto"
        >
          {developers.map((dev, index) => (
            <motion.div
              key={dev.name}
              variants={itemVariants}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="card-body">
                <div className="flex flex-col items-center text-center mb-6">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-blue-700/20"
                  >
                    <img
                      src={dev.avatar}
                      alt={dev.name}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-2">{dev.name}</h2>
                  <p className="text-base-content/70 mb-4">{dev.role}</p>
                  <div className="flex gap-4">
                    <motion.a
                      href={dev.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn btn-ghost btn-circle"
                    >
                      <FaGithub className="text-2xl" />
                    </motion.a>
                    <motion.a
                      href={dev.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn btn-ghost btn-circle"
                    >
                      <FaLinkedin className="text-2xl" />
                    </motion.a>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <FaCode className="text-blue-700" /> About
                    </h3>
                    <p className="text-base-content/80">{dev.bio}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <FaLaptopCode className="text-blue-700" /> Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {dev.skills.map((skill, index) => (
                        <motion.span
                          key={skill.name}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="badge badge-primary badge-outline hover:badge-primary transition-colors duration-300 flex items-center gap-2"
                        >
                          {skill.icon}
                          {skill.name}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <FaServer className="text-blue-700" /> Expertise
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {dev.expertise.map((item, index) => (
                        <motion.span
                          key={item}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="badge badge-secondary badge-outline hover:badge-secondary transition-colors duration-300"
                        >
                          {item}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <FaDatabase className="text-blue-700" /> Achievements
                    </h3>
                    <ul className="space-y-2">
                      {dev.achievements.map((achievement, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-2 text-base-content/80"
                        >
                          <div className="w-2 h-2 rounded-full bg-blue-700"></div>
                          {achievement}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-base-content/70">
            Together, we're building the future of coding education
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProfilePage; 