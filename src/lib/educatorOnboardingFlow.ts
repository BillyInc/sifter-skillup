/** Prevent an async saved-draft restore from overwriting a choice made now. */
export function shouldRestoreEducatorDraft(userHasChosenOrganisation: boolean): boolean {
  return !userHasChosenOrganisation;
}
