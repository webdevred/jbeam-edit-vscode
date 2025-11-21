{
    if (system("dpkg --compare-versions " $0 " gt " min) ==0) latest=$0
} END { if (latest) print latest }
  
