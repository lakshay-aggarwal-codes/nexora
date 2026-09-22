import proxy from "express-http-proxy";

export const proxyWithHeader = (serviceURL) => {
  return proxy(serviceURL, {
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      if (srcReq.user) {
        proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
      }
      return proxyReqOpts 
    },
  });
};
