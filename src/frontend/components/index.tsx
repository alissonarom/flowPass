// import React, { useState } from "react";
// import { IDetectedBarcode, Scanner } from '@yudiel/react-qr-scanner';

// // Definindo as props do componente
// interface QrCodeReaderProps {
//   onScan: (data: string) => void; // Função chamada quando um QR code é lido
// }

// const QrCodeReader: React.FC<QrCodeReaderProps> = ({ onScan }) => {
//   // Estado para armazenar mensagens de erro
//   const [error, setError] = useState<string | null>(null);

//   // Função chamada quando um QR code é lido com sucesso
//   const handleScan = (detectedCodes: IDetectedBarcode[]) => {
//     if (detectedCodes && detectedCodes.length > 0) {
//       const data = detectedCodes[0].rawValue; // Extrai o valor do primeiro código detectado
//       if (data) {
//         onScan(data); // Chama a função onScan passada via props
//       }
//     }
//   };

//   // Função chamada em caso de erro na leitura do QR code
//   const handleError = (err: any) => {
//     setError(err.message || "Erro ao ler o QR code"); // Define a mensagem de erro
//   };

//   return (
//     <div>
//       {/* Exibe mensagens de erro, se houver */}
//       {error && <p>Erro ao ler o QR code: {error}</p>}

//       {/* Componente de leitura de QR code */}
//       <Scanner
//         onError={handleError} // Função chamada em caso de erro
//         onScan={handleScan} // Função chamada quando um QR code é lido
//       />
//     </div>
//   );
// };

// export default QrCodeReader;

import { Html5QrcodeScanner } from "html5-qrcode";
import React, { useEffect } from "react";

const QrCodeReader: React.FC = () => {
  useEffect(() => {
    const qrCodeReaderElement = document.getElementById("qr-code-reader");

    if (qrCodeReaderElement && qrCodeReaderElement.requestFullscreen) {
      qrCodeReaderElement.requestFullscreen().catch((err) => {
        console.error("Erro ao tentar entrar em tela cheia:", err);
      });
    }

    const scanner = new Html5QrcodeScanner(
      "qr-code-reader", // ID do elemento HTML onde o leitor será renderizado
      {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 5,
      },
      false // Verbose (opcional)
    );

    scanner.render(
      (data) => {
        console.log("QR code lido:", data);
        scanner.clear(); // Para o scanner após a leitura
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
      },
      (error) => {
        console.error("Erro ao ler o QR code:", error);
      }
    );

    return () => {
      scanner.clear(); // Limpa o scanner ao desmontar o componente

      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    };
  }, []);

  return (
    <div
      id="qr-code-reader"
      style={{
        width: "100vw", // Ocupa 100% da largura da viewport
        height: "100vh", // Ocupa 100% da altura da viewport
        position: "fixed", // Fixa o elemento na tela
        top: 0,
        left: 0,
        backgroundColor: "black", // Fundo preto para melhorar a visibilidade
      }}
    ></div>
  );
};

export default QrCodeReader;
