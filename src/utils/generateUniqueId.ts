import { Supplier } from "../app/modules/supplier/supplier.model";

const findLastSupplierId = async () => {
  const lastItem = await Supplier.findOne(
    {},
    {
      supplierId: 1,
      _id: 0,
    }
  )
    .sort({
      createdAt: -1,
    })
    .lean();

  return lastItem?.supplierId ? lastItem.supplierId : undefined;
};

export const generateSupplierId = async () => {
  let currentId = "0";
  const lastSupplierId = await findLastSupplierId();

  if (lastSupplierId) {
    currentId = lastSupplierId;
  }

  const incrementId = (Number(currentId) + 1).toString().padStart(3, "0");

  return incrementId;
};
