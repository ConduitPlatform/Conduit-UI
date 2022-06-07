import { Box, Card, Divider, styled, Typography } from "@mui/material";
import React, { FC } from "react";

const BoxWithIconText = styled(Box)(() => ({
  display: 'flex',
  flex: 1,
  alignItems: 'center',
  flexWrap: 'nowrap',
  overflow: 'hidden'
}));

const CustomizedDivider = styled(Divider)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  marginBottom: "10px",
}));

const CustomizedCard = styled(Card)(() => ({
  display: 'flex',
  flex: 1,
  borderRadius: 8,
  backgroundColor: 'common.white',
  flexDirection: 'column',
  padding: 20,
  '&:hover': {
    boxShadow: `0px 3px 12px rgba(138, 138, 138, 0.25)`,
  },
  '&:focus': {
    boxShadow: `0px 3px 12px rgba(138, 138, 138, 0.25)`,
  },
}));

interface Props {
  icon: any;
  title: string;
  description: string;
  titleProps: object | undefined;
  subtitleProps: object | undefined;
}

const HomePageCard: FC<Props> = ({ icon, title, description,titleProps,subtitleProps }) => {
  return (
    <CustomizedCard>
      <BoxWithIconText>
        {icon}
        <Typography {...titleProps}> &nbsp; {title}</Typography>
      </BoxWithIconText>
      <CustomizedDivider />
      <Typography variant="subtitle2" {...subtitleProps}>{description}</Typography>
    </CustomizedCard>
  );
};

export default HomePageCard;
