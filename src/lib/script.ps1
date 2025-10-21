 Get-NetAdapter | Where-Object {
        $_.InterfaceDescription -like "*Wi-Fi Direct*" -or 
        $_.InterfaceDescription -like "*Microsoft Hosted Network*"
      } | Select-Object Name, Status, InterfaceDescription | ConvertTo-Json