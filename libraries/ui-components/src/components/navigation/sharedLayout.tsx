import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useRouter } from "next/router";
import SwaggerModal from "../SwaggerModal";
import LinkComponent from "../LinkComponent";

interface Props {
  pathNames: string[];
  swagger: string;
  icon: JSX.Element;
  swaggerIcon: JSX.Element;
  graphQLIcon: JSX.Element;
  labels: { name: string; id: string }[];
  title: string;
  baseUrl: string;
  loader: JSX.Element;
}

const SharedLayout: React.FC<Props> = ({
  children,
  pathNames,
  swagger,
  icon,
  swaggerIcon,
  graphQLIcon,
  labels,
  title,
  baseUrl,
  loader,
}) => {
  const router = useRouter();
  const [value, setValue] = useState(0);
  const [swaggerOpen, setSwaggerOpen] = useState<boolean>(false);
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const index = pathNames.findIndex(
      (pathname: string) => pathname === router.pathname
    );
    setValue(index);
  }, [router.pathname, pathNames]);

  return (
    <Box sx={{ height: "100vh", p: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Box display="flex" alignItems="center">
          <Typography variant={"h4"}>{title}</Typography>
          <Box display="flex" alignItems="center">
            {title !== "Settings" && (
              <Box whiteSpace={"nowrap"}>
                <Button
                  color="primary"
                  sx={{ textDecoration: "none", ml: 8 }}
                  variant="outlined"
                  onClick={() => setSwaggerOpen(true)}
                >
                  {swaggerIcon}
                  <Typography sx={{ ml: smallScreen ? 0 : 1 }}>
                    {smallScreen ? null : "SWAGGER"}
                  </Typography>
                </Button>
                <a
                  style={{ textDecoration: "none", paddingLeft: 10 }}
                  href={`${baseUrl}/graphql`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button color="primary" variant="outlined">
                    {graphQLIcon}
                    <Typography sx={{ ml: smallScreen ? 0 : 1 }}>
                      {smallScreen ? null : "GraphQL"}
                    </Typography>
                  </Button>
                </a>
              </Box>
            )}
            {loader}
          </Box>
        </Box>
        <Tabs value={value} indicatorColor="primary" sx={{ mt: 2 }}>
          {labels.map((label: { name: string; id: string }, index: number) => {
            return (
              <LinkComponent
                href={pathNames[index]}
                key={index}
                underline={"none"}
                color={"#FFFFFF"}
              >
                <Tab
                  label={label.name}
                  id={label.id}
                  sx={
                    value === index
                      ? {
                          opacity: 1,
                          "&:hover": {
                            textDecoration: "none",
                          },
                        }
                      : {
                          "&:hover": {
                            textDecoration: "none",
                          },
                        }
                  }
                />
              </LinkComponent>
            );
          })}
        </Tabs>
        <SwaggerModal
          open={swaggerOpen}
          setOpen={setSwaggerOpen}
          title={title}
          icon={icon}
          swagger={swagger}
          baseUrl={baseUrl}
        />
      </Box>
      <Box>{children}</Box>
    </Box>
  );
};

export default SharedLayout;
