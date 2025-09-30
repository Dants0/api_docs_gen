"use client"
import dynamic from "next/dynamic";

const SwaggerUi = dynamic(() => import("swagger-ui-react"), {
  ssr: false,
});

import "swagger-ui-react/swagger-ui.css";

export default function DocsPage() {
  return <SwaggerUi url="http://localhost:3001/docs/json" />;
}