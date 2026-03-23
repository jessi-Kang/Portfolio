import { useState } from 'react'
import SectionWrapper from './ui/SectionWrapper'
import ProjectCard from './ProjectCard'
import { loadProjects } from '../data/projects'

export default function Projects() {
  const [data] = useState(loadProjects)
  const hasContent = data.groups?.some((g) => g.projects?.some((p) => p.title))

  if (!hasContent) return null

  return (
    <SectionWrapper id="projects">
      <p className="text-accent text-xs font-mono tracking-widest uppercase mb-2">Projects</p>
      <h2 className="text-2xl md:text-3xl font-bold mb-12">Featured Projects</h2>

      <div className="space-y-16">
        {data.groups.map((group, gi) => (
          <div key={gi}>
            {/* Group Header */}
            <div className="mb-6">
              <h3 className="text-lg md:text-xl font-bold text-white">{group.title}</h3>
              <p className="text-sm md:text-base text-gray-500 mt-1">{group.subtitle}</p>
            </div>

            {/* Project Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.projects.map((project, pi) => {
                const isLast = pi === group.projects.length - 1
                const isOdd = group.projects.length % 2 === 1
                const span = (project.fullWidth || (isLast && isOdd)) ? 'md:col-span-2' : ''
                return (
                  <div key={project.id} id={`project-${project.id}`} className={`${span} transition-all duration-500`}>
                    <ProjectCard project={project} />
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  )
}
