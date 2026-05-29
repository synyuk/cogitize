class Cookie {
  setCookie(name: string, value: string, days?: number) {
    document.cookie = `${name}=${value}; path=/; ${
      days && `max-age=${days * 24 * 60 * 60}`
    } `;
  }

  getCookie(name: string) {
    const cookie = document.cookie
      .split(";")
      .find((c) => c.trim().startsWith(`${name}=`))
      ?.replace(`${name}=`, "");
    return cookie?.trim() || "";
  }

  deleteCookie(name: string) {
    document.cookie = `${name}=; Max-Age=-99999999;`;
  }
}

const cookie = new Cookie();

export default cookie;
