// function createSlug(title) {
//   return title.toLowerCase().replace(/\s+/g, "-";
// }

// export default createSlug;

function createSlug(title: any) {
  return title
    .toLowerCase()
    .replace(/[\s/"',()[\]{}]+/g, "-") // Replace spaces and specified symbols with '-'
    .replace(/-+/g, "-") // Replace multiple consecutive '-' with a single '-'
    .replace(/^-|-$/g, ""); // Remove leading or trailing '-'
}

export default createSlug;
