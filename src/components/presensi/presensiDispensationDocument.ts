/**
 * Opens a filed dispensation document, either in a new tab or as a saved copy
 * under its own name. Both work straight off the file the teacher picked, so no
 * server is needed.
 *
 * @param file - The filed document, absent until one has been uploaded.
 * @param mode - Whether to show the document or save a copy of it.
 * @returns Nothing when no document is filed.
 */
export function openDispensationDocument(file: File | null, mode: 'download' | 'preview'): void {
  if (!file) {
    return;
  }

  const url = URL.createObjectURL(file);

  if (mode === 'download') {
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(url);
    return;
  }

  // shortcut: the opened tab needs the URL to outlive this call, so it is not revoked
  window.open(url, '_blank', 'noopener');
}
