"use client";

import Navbar from "@/components/Navbar";
import { RepoList } from "@/components/RepoList";
import { useState, useEffect } from "react";

export default function Repos() {


  return (
    <>
      <Navbar />
      <RepoList />
    </>
  )
}
