export function down(fileName: string, data: any) {
  const urlObject = URL;
  const export_blob = new Blob([data]);
  const save_link = document.createElement('a');
  save_link.target = '_blank';
  save_link.href = urlObject.createObjectURL(export_blob);
  save_link.download = fileName;
  save_link.click();
}
