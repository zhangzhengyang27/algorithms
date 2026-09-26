import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProblemsService } from './problems.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProblemDto } from './dto/create-problem.dto';

const mockPrisma = {
  category: {
    findUnique: jest.fn(),
  },
  problem: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    findMany: jest.fn(),
  },
};

describe('ProblemsService', () => {
  let service: ProblemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProblemsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get(ProblemsService);
    jest.clearAllMocks();
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const baseDto = {
      categoryId: 'cat-1',
      title: 'Two Sum',
      slug: 'two-sum',
      descriptionMd: 'desc',
    } as CreateProblemDto;

    it('throws NotFoundException when the category does not exist (FK check)', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);
      await expect(service.create(baseDto)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.problem.create).not.toHaveBeenCalled();
    });

    it('creates the problem when the category exists', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: 'cat-1' });
      mockPrisma.problem.create.mockResolvedValue({ id: 'p-1' });
      const result = await service.create(baseDto);
      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
      });
      expect(mockPrisma.problem.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ id: 'p-1' });
    });
  });

  describe('update', () => {
    it('throws NotFoundException when the problem does not exist', async () => {
      mockPrisma.problem.findUnique.mockResolvedValue(null);
      await expect(service.update('p-1', { title: 'X' } as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException when the new category does not exist', async () => {
      mockPrisma.problem.findUnique.mockResolvedValue({ id: 'p-1', categoryId: 'cat-old' });
      mockPrisma.category.findUnique.mockResolvedValue(null);
      await expect(
        service.update('p-1', { categoryId: 'cat-new' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('does not check the category when categoryId is unchanged', async () => {
      mockPrisma.problem.findUnique.mockResolvedValue({ id: 'p-1', categoryId: 'cat-old' });
      mockPrisma.problem.update.mockResolvedValue({ id: 'p-1' });
      await service.update('p-1', { title: 'New' } as any);
      expect(mockPrisma.category.findUnique).not.toHaveBeenCalled();
      expect(mockPrisma.problem.update).toHaveBeenCalledWith({
        where: { id: 'p-1' },
        data: { title: 'New' },
      });
    });
  });
});
