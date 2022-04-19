import { Box, Card, Divider, styled, Typography } from "@mui/material";
import React, { FC } from "react";

const BoxWithIconText = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
}));

const CustomizedDivider = styled(Divider)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  marginBottom: "10px",
}));

const CustomizedCard = styled(Card)(() => ({
  borderRadius: 8,
  backgroundColor: "common.white",
  flex: 1,
  display: "flex",
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
  icon: any;
  title: string;
  description: string;
}

const HomePageCard: FC<Props> = ({ icon, title, description }) => {
  return (
    <CustomizedCard>
      <BoxWithIconText>
        {icon}
        <Typography> &nbsp; {title}</Typography>
      </BoxWithIconText>
      <CustomizedDivider />
      <Typography variant="subtitle2">{description}</Typography>
    </CustomizedCard>
  );
};

export default HomePageCard;
