import React, {useEffect, useState} from "react";
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
import GraphQLModal from "../GraphQLModal";
import {IAdminSettings} from "@conduitplatform/conduit-ui/src/models/settings/SettingsModels";
import {IRouterConfig} from "@conduitplatform/conduit-ui/src/models/router/RouterModels";

interface Props {
  pathNames: string[];
  swagger?: string;
  graphQL?: string;
  icon: JSX.Element;
  swaggerIcon: JSX.Element;
  graphQLIcon: JSX.Element;
  labels: { name: string; id: string }[];
  title: string;
  loader: JSX.Element;
  transportsAdmin: IAdminSettings['transports'];
  transportsRouter: IRouterConfig['transports'];
  noSwagger: boolean;
  noGraphQL: boolean;
  configActive?: boolean;
  SERVICE_API?: string;
  CONDUIT_API?: string;
}



const SharedLayout: React.FC<Props> = ({
  children,
  pathNames,
  swagger,
  graphQL,
  icon,
  swaggerIcon,
  graphQLIcon,
  labels,
  title,
  loader,
  transportsAdmin,
  transportsRouter,
  noSwagger,
  noGraphQL,
  configActive,
  SERVICE_API,
  CONDUIT_API
}) => {
  const router = useRouter();
  const [value, setValue] = useState(0);
  const [swaggerOpen, setSwaggerOpen] = useState<boolean>(false);
  const [graphQLOpen, setGraphQLOpen] = useState<boolean>(false);
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    if(!configActive){
      setValue(labels.length-1);
      return;
    }
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
                {noSwagger ? null :
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
                }
                {noGraphQL ? null :
                  <Button color="primary" variant="outlined" onClick={() => setGraphQLOpen(true)} sx={{ ml: 2 }}
                  >
                    {graphQLIcon}
                    <Typography sx={{ ml: smallScreen ? 0 : 1 }}>
                      {smallScreen ? null : "GraphQL"}
                    </Typography>
                  </Button>
                }
              </Box>
            )}
            <Box px={3}>{loader}</Box>
          </Box>
        </Box>
        <Tabs value={value} indicatorColor="primary" sx={{ mt: 2 }}>
          {labels.map((label: { name: string; id: string }, index: number) => {
            const disabled = !configActive ? index < labels.length - 1 : false;
            return (
              <LinkComponent
                href={pathNames[index]}
                key={index}
                underline={"none"}
                color={"#FFFFFF"}
                disabled={disabled}
              >
                <Tab
                  disabled={disabled}
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
          baseUrl={SERVICE_API}
          adminUrl={CONDUIT_API}
          transportsAdmin={transportsAdmin}
          transportsRouter={transportsRouter}
        />
        <GraphQLModal
          open={graphQLOpen}
          setOpen={setGraphQLOpen}
          title={title}
          icon={icon}
          graphQl={graphQL}
          baseUrl={SERVICE_API}
          adminUrl={CONDUIT_API}
          transportsAdmin={transportsAdmin}
          transportsRouter={transportsRouter}
        />
      </Box>
      <Box>{children}</Box>
    </Box>
  );
};

export default SharedLayout;
