import { HttpStatusCode } from "axios";
import AppError from "../../errors/APiError";
import { IContact } from "./contact.interface";
import { ContactModel } from "./contact.model";

type FindAllContactsParams = {
  page?: number;
  limit?: number;
  searchTerm?: string;
  name?: string;
  email?: string;
  subject?: string;
  sort?: "newest" | "oldest" | "nameAsc" | "nameDesc";
};

const escapeRegex = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const createContact = async (payload: Partial<IContact>): Promise<IContact> => {
  const name = payload.name?.trim();
  const email = payload.email?.trim().toLowerCase();
  const subject = payload.subject?.trim();
  const message = payload.message?.trim();

  if (!name) {
    throw new AppError(HttpStatusCode.BadRequest, "name is required");
  }
  if (!email) {
    throw new AppError(HttpStatusCode.BadRequest, "email is required");
  }
  if (!subject) {
    throw new AppError(HttpStatusCode.BadRequest, "subject is required");
  }
  if (!message) {
    throw new AppError(HttpStatusCode.BadRequest, "message is required");
  }

  const created = await ContactModel.create({
    name,
    email,
    subject,
    message,
  });

  return created.toObject() as IContact;
};

const findContactById = async (id: string): Promise<IContact> => {
  const contact = await ContactModel.findById(id).lean();

  if (!contact) {
    throw new AppError(HttpStatusCode.NotFound, "Contact not found");
  }

  return contact as unknown as IContact;
};

const findAllContacts = async (params: FindAllContactsParams = {}) => {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 20));
  const skip = (page - 1) * limit;

  const filter: Record<string, any> = {};

  const searchTerm = params.searchTerm?.trim();
  if (searchTerm) {
    const rx = new RegExp(escapeRegex(searchTerm), "i");
    filter.$or = [{ name: rx }, { email: rx }, { subject: rx }, { message: rx }];
  }

  if (params.name?.trim()) {
    filter.name = new RegExp(escapeRegex(params.name.trim()), "i");
  }

  if (params.email?.trim()) {
    filter.email = new RegExp(escapeRegex(params.email.trim()), "i");
  }

  if (params.subject?.trim()) {
    filter.subject = new RegExp(escapeRegex(params.subject.trim()), "i");
  }

  const sortMap: Record<NonNullable<FindAllContactsParams["sort"]>, any> = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    nameAsc: { name: 1 },
    nameDesc: { name: -1 },
  };

  const sort = params.sort ? sortMap[params.sort] : sortMap.newest;

  const [items, total] = await Promise.all([
    ContactModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    ContactModel.countDocuments(filter),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
    data: items as unknown as IContact[],
  };
};

export const ContactService = {
  createContact,
  findContactById,
  findAllContacts,
};
