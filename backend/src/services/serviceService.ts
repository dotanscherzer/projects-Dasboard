import Service from '../models/Service';
import { IService } from '../models/Service';

class ServiceService {
  async createService(data: Partial<IService>): Promise<IService> {
    const service = new Service(data);
    return await service.save();
  }

  async getServiceById(id: string): Promise<IService | null> {
    return await Service.findById(id);
  }

  async getServiceByProvider(provider: string, providerInternalId: string): Promise<IService | null> {
    return await Service.findOne({ provider, providerInternalId });
  }

  async getAllServices(filter: any = {}): Promise<IService[]> {
    return await Service.find(filter).populate('projectId', 'name code').sort({ createdAt: -1 });
  }

  async updateService(id: string, data: Partial<IService>): Promise<IService | null> {
    return await Service.findByIdAndUpdate(id, data, { new: true });
  }

  async updateServiceByProvider(
    provider: string,
    providerInternalId: string,
    data: Partial<IService>
  ): Promise<IService | null> {
    return await Service.findOneAndUpdate({ provider, providerInternalId }, data, { new: true });
  }

  async deleteService(id: string): Promise<void> {
    await Service.findByIdAndDelete(id);
  }
}

export default new ServiceService();

