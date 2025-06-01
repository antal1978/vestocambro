import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"

export default function Page() {
  return (
    <div className="container py-10">
      <div className="flex justify-center mb-6">
        <Button>Cargar Ejemplos</Button>
      </div>

      <Tabs defaultValue="prendas" className="w-[100%]">
        <TabsList>
          <TabsTrigger value="prendas">Prendas</TabsTrigger>
          <TabsTrigger value="looks">Looks</TabsTrigger>
        </TabsList>
        <TabsContent value="prendas">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Remera Estampada</CardTitle>
                <CardDescription>Algodón peinado, varios talles</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <Image src="/images/remera.png" alt="Remera Estampada" width={200} height={200} />
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button>Ver más</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Jean Clásico</CardTitle>
                <CardDescription>Corte recto, talles del 38 al 48</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <Image src="/images/jean.png" alt="Jean Clásico" width={200} height={200} />
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button>Ver más</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Zapatillas Urbanas</CardTitle>
                <CardDescription>Cuero ecológico, varios colores</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <Image src="/images/zapatillas.png" alt="Zapatillas Urbanas" width={200} height={200} />
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button>Ver más</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Camisa a Cuadros</CardTitle>
                <CardDescription>Franela suave, talles S a XL</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <Image src="/images/camisa.png" alt="Camisa a Cuadros" width={200} height={200} />
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button>Ver más</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="looks">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Look Casual Urbano</CardTitle>
                <CardDescription>Ideal para el día a día</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <Image src="/images/look1.png" alt="Look Casual Urbano" width={200} height={200} />
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button>Ver más</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Look Noche Elegante</CardTitle>
                <CardDescription>Para una salida especial</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <Image src="/images/look2.png" alt="Look Noche Elegante" width={200} height={200} />
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button>Ver más</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Look Deportivo</CardTitle>
                <CardDescription>Comodidad y estilo para entrenar</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <Image src="/images/look3.png" alt="Look Deportivo" width={200} height={200} />
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button>Ver más</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Look Oficina Casual</CardTitle>
                <CardDescription>Profesional pero relajado</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <Image src="/images/look4.png" alt="Look Oficina Casual" width={200} height={200} />
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button>Ver más</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
