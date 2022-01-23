import { FunctionComponent } from 'react';
import { Heading, Paper, Stack, Box, Text } from 'aws-northstar';

const Dashboard: FunctionComponent = () => {
    return (
        <Paper>
            <Box p={1} width="100%">
                <Stack spacing="xs">
                    <Heading variant='h1'>All-In-One AI</Heading>
                    <Text>
                        <b>Introduction</b>
                    </Text>
                    <Text variant="p">
                        2022 Gartner Survey revealed a 3.6% year-over-year growth rate, the fastest in more than a decade. In terms of specific technologies driving this surge in expenditure would be artificial intelligence (AI) and machine learning (ML), accounting for a whopping 48% of the whole pie. The survey also highlights the relative immaturity of AI technologies compared to the other innovation areas. Just over half of respondents report significant target customer adoption of their AI-enabled products and services. 41% of respondents cited AI emerging technologies as still being in development or early adoption stages, meaning there is a wave of potential adoption as new or augmented AI products and services enter general availability. 
Technology immaturity is cited as a top reason among AI-investing organizations leading to failure when integrating an emerging technology. Furthermore, product leaders investing in AI whose implementations are progressing slower than expected reported product complexity and a lack of skills as the main hindrances to their progress. There are a couple of industry AI/ML models built on top of AWS SageMaker as the supplement of AWS managed AI/ML services. Those AI/ML models are scattered, lack of web visualization, and not ready to present to customer directly, especially for the customers’ business staff. The customers may not aware of the existing matured AI/ML models which can solve their complex business problems. It will be nice to allow the customers to get aware of the matured AI/ML models existing in AWS for specific industry AI/ML scenarios and experience the AI/ML models in an intuitive way and adopt directly or after customization.</Text>
                    <Text>
                        <b>Who are the customers, their persona, and their pain points</b>
                    </Text>
                    <Text variant='p'>
                        The customers can be defined as business related (business owner and business operation) and IT related (data scientist and application developer). Business owner is more focused on the business impact in general and usually it is the decision-maker. Business operation is more focused on daily business operation and usually it is the end-user of the business operation system. Data scientist is more focused on the creation, fine-tuning and performance measurement of the AI/ML model which will be used in the business operation system. Application developer is more focused on the engineering implementation of the business operation system. To be simplified, term “Business” will represent the business owner and business operation in short and term “IT” will represent the data scientist and application developer in short. 
                    </Text>
                    <Text>
                        <b>What will our solution look like?</b>
                    </Text>
                    <Text variant='p'>
                        Our solution will sort out all the existing industry AI/ML models, figure out the specific AI/ML scenario and underlying AI/ML models, facilitate the pipeline from model training, endpoint deployment and data inference in the cloud and in the edge device, visualize the whole process, and present to the customers’ Business and IT. Typically our solution will consist of some specific industry AI/ML scenarios, underlying AI/ML models packaged as bundle, common AI/ML pipeline framework, common visualization framework, and demo website.                     </Text>
                    <Text>
                        <b>What’s the to-be customer/partner/AWS journey?</b>
                    </Text>
                    <Text variant='p'>
                        AWS builds this solution for some specific industry AI/ML scenarios with underlying AI/ML models packaged as bundle, common AI/ML pipeline framework, common visualization framework, and demo website. AWS promote this solution internally and externally. AWS sorts out suitable partners and co-works with partners to host the demo website and promote the solution to market. Customers hope to achieve business growth and data safety, reduce human efforts via AI/ML capability with lower cost and easy to use to solve complex business problem in specific industry AI/ML scenarios. Customers get aware of our solution from social media, marketing events, SEO, open-source project, technical blogs, and demo websites hosted by partners and AWS. Customers experience the demo websites and then contact partners or AWS. AWS invite partners to be involved in the opportunities. Partner co-works with customers to collect business requirement, identify the pain point, clarify the budget and project scope, and figure out the core technical problems. Customers deploy this solution into their AWS account. Customers may adopt the AI/ML models directly or customize with fine-tuned versions by themselves or co-working with partners or even AWS. The fine-tuned AI/ML models get integrated with this solution to accumulate AI/ML capabilities.  Customers evaluate the business impact. Customers co-work with partners and AWS on marketing promotion. Customers may move more workloads to AWS. Partners may extend their product lines after acquiring more AI/ML capabilities by integrating with this solution.                    </Text>
                </Stack>
            </Box>
        </Paper>
    )
}

export default Dashboard;
