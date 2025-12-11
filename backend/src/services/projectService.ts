import Project from '../models/Project';
import { IProject } from '../models/Project';

class ProjectService {
  async createProject(data: Partial<IProject>): Promise<IProject> {
    const project = new Project(data);
    return await project.save();
  }

  async getProjectById(id: string): Promise<IProject | null> {
    return await Project.findById(id);
  }

  async getAllProjects(filter: any = {}): Promise<IProject[]> {
    return await Project.find(filter).sort({ createdAt: -1 });
  }

  async updateProject(id: string, data: Partial<IProject>): Promise<IProject | null> {
    return await Project.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteProject(id: string): Promise<void> {
    await Project.findByIdAndDelete(id);
  }
}

export default new ProjectService();

