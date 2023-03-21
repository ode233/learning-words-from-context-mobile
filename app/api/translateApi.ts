export const getYoudaoFreeTranslate = async (content: string) => {
  const response = await fetch(
    "https://fanyi.youdao.com/translate?&doctype=json&type=AUTO&i=" +
      encodeURIComponent(content)
  );
  return response.json();
};

export const getCaiyunTranslate = async (content: string, token: string) => {
  const response = await fetch(
    "https://api.interpreter.caiyunai.com/v1/translator",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-authorization": "token " + token,
      },
      body: JSON.stringify({
        source: [content],
        trans_type: "auto2zh",
        detect: true,
      }),
    }
  );
  return response.json();
};

export const dataUrlToBlob = async (dataUrl: string) => {
  const response = await fetch(dataUrl);
  return response.blob();
};
