import { Box, Divider, Paper, styled, Typography } from "@mui/material";
import React, { FC, ReactNode } from "react";

const BoxWithIconText = styled(Box)(() => ({
  display: "flex",
  flex: 1,
  alignItems: "center",
  flexWrap: "nowrap",
  overflow: "hidden",
}));

const CustomizedDivider = styled(Divider)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  marginBottom: "10px",
}));

const CustomizedCard = styled(Paper)(() => ({
  display: "flex",
  flex: 1,
  borderRadius: 8,

  flexDirection: "column",
  padding: 20,
  "&:hover": {
    boxShadow: `0px 3px 12px rgba(138, 138, 138, 0.25)`,
  },
  "&:focus": {
    boxShadow: `0px 3px 12px rgba(138, 138, 138, 0.25)`,
  },
}));

interface Props {
  icon?: ReactNode;
  title?: string;
  descriptionContent: JSX.Element;
  theme?: "light" | "dark";
}

const HomePageCard: FC<Props> = ({
  icon,
  title,
  descriptionContent,
  theme = "dark",
}) => {
  return (
    <CustomizedCard
      elevation={theme === "light" ? 8 : 3}
      sx={{
        backgroundColor: theme === "light" ? "#262840" : undefined,
      }}
    >
      {title && (
        <>
          <BoxWithIconText>
            {icon && icon}
            <Typography noWrap>&nbsp; {title}</Typography>
          </BoxWithIconText>
          <CustomizedDivider />
        </>
      )}
      {descriptionContent}
    </CustomizedCard>
  );
};

export default HomePageCard;
