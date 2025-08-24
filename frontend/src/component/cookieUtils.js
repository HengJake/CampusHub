// Programmer Name : Heng Jun Kai, Project Manager, Leader Full Stack developer
// Program Name: cookieUtils.js
// Description: Utility functions for managing browser cookies, including setting, getting, and removing cookies for authentication and user preferences
// First Written on: June 20, 2024
// Edited on: Friday, August 9, 2024

export function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/";
}

// Get a cookie by name
export function getCookie(name) {
  const nameEQ = name + "=";
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    let c = cookies[i].trim();
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length));
    }
  }
  return null;
}

// Delete a cookie by name
export function deleteCookie(name) {
  document.cookie = name + "=; Max-Age=0; path=/";
}