import { UserModel } from "../app/modules/user/user.model";

const findLastUuid = async () => {
  const lastItem = await UserModel.findOne(
    {},
    {
      uuid: 1,
      _id: 0,
    },
  )
    .sort({
      createdAt: -1,
    })
    .lean();

  return lastItem?.uuid ? lastItem.uuid : undefined;
};

export const generateUUId = async () => {
  let currentId = "0";
  const currentYear = new Date().getFullYear().toString().slice(-2);

  const lastUUid = await findLastUuid();

  if (lastUUid && currentYear === lastUUid.slice(4, 6)) {
    currentId = lastUUid.substring(6);
  }

  const incrementId = (Number(currentId) + 1).toString().padStart(6, "0");

  return `USR-${currentYear}${incrementId}`;
};
