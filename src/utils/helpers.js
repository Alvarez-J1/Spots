const FORM_ERROR_CLASS = "modal__form-error";
const buttonAccessibleNames = new WeakMap();

function getFormErrorId(formEl) {
  return `${formEl.id || formEl.name || "modal"}-form-error`;
}

export function setButtonText(
  submitBtn,
  isLoading,
  defaultText = "Save",
  loadingText = "Saving..."
) {
  if (!submitBtn) {
    return;
  }

  if (isLoading) {
    if (!buttonAccessibleNames.has(submitBtn)) {
      buttonAccessibleNames.set(submitBtn, submitBtn.getAttribute("aria-label"));
    }
    const originalName = buttonAccessibleNames.get(submitBtn);
    if (originalName) {
      submitBtn.setAttribute("aria-label", originalName + " (" + loadingText + ")");
    }
    submitBtn.textContent = loadingText;
    submitBtn.disabled = true;
    submitBtn.setAttribute("aria-disabled", "true");
    submitBtn.setAttribute("aria-busy", "true");
  } else {
    const originalName = buttonAccessibleNames.get(submitBtn);
    if (originalName) submitBtn.setAttribute("aria-label", originalName);
    buttonAccessibleNames.delete(submitBtn);
    submitBtn.textContent = defaultText;
    submitBtn.removeAttribute("aria-busy");
    if (!submitBtn.classList.contains("modal__submit-btn_disabled")) {
      submitBtn.disabled = false;
      submitBtn.removeAttribute("aria-disabled");
    } else {
      submitBtn.disabled = true;
      submitBtn.setAttribute("aria-disabled", "true");
    }
  }
}

export function showFormError(formEl, message) {
  let errorEl = formEl.querySelector(`.${FORM_ERROR_CLASS}`);
  if (!errorEl) {
    errorEl = document.createElement("p");
    errorEl.id = getFormErrorId(formEl);
    errorEl.className = FORM_ERROR_CLASS;
    errorEl.setAttribute("role", "alert");
    errorEl.setAttribute("aria-atomic", "true");
    formEl.prepend(errorEl);
  }
  errorEl.textContent =
    message || "Something went wrong. Please try again.";
  errorEl.hidden = false;
  const descriptionIds = new Set(
    formEl.getAttribute("aria-describedby")?.split(/\s+/).filter(Boolean) || []
  );
  descriptionIds.add(errorEl.id);
  formEl.setAttribute("aria-describedby", Array.from(descriptionIds).join(" "));
}

export function clearFormError(formEl) {
  const errorEl = formEl.querySelector(`.${FORM_ERROR_CLASS}`);
  if (errorEl) {
    errorEl.hidden = true;
    errorEl.textContent = "";
    const descriptionIds = (
      formEl.getAttribute("aria-describedby")?.split(/\s+/).filter(Boolean) || []
    ).filter((id) => id !== errorEl.id);
    if (descriptionIds.length) {
      formEl.setAttribute("aria-describedby", descriptionIds.join(" "));
    } else {
      formEl.removeAttribute("aria-describedby");
    }
  }
}

export function setFormBusy(formEl, isBusy) {
  if (!formEl) {
    return;
  }

  if (isBusy) {
    formEl.setAttribute("aria-busy", "true");
  } else {
    formEl.removeAttribute("aria-busy");
  }
}
