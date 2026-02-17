import { Request, RequestHandler, Response } from "express";
import status from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { IContact } from "./contact.interface";
import { ContactService } from "./contact.service";

const createContact: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ContactService.createContact(req.body as Partial<IContact>);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Contact message submitted successfully!",
      data: result,
    });
  },
);

const getContactById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ContactService.findContactById(id as string);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Contact fetched successfully!",
      data: result,
    });
  },
);

const getAllContacts: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { page, limit, searchTerm, name, email, subject, sort } = req.query;

    const result = await ContactService.findAllContacts({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      searchTerm: searchTerm ? String(searchTerm) : undefined,
      name: name ? String(name) : undefined,
      email: email ? String(email) : undefined,
      subject: subject ? String(subject) : undefined,
      sort: sort ? (String(sort) as any) : undefined,
    });

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Contacts fetched successfully!",
      data: result,
    });
  },
);

export const ContactController = {
  createContact,
  getContactById,
  getAllContacts,
};
