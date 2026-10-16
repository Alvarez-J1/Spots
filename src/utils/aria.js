const getDescriptionIds = (element) => new Set(
  element.getAttribute("aria-describedby")?.split(/\s+/).filter(Boolean) || []
);

/** Add a description without replacing existing hints or duplicating IDs. */
export function addDescription(element, id) {
  const ids = getDescriptionIds(element);
  ids.add(id);
  element.setAttribute("aria-describedby", Array.from(ids).join(" "));
}

/** Remove only the requested description, preserving all remaining hints. */
export function removeDescription(element, id) {
  const ids = getDescriptionIds(element);
  ids.delete(id);
  if (ids.size) {
    element.setAttribute("aria-describedby", Array.from(ids).join(" "));
  } else {
    element.removeAttribute("aria-describedby");
  }
}
